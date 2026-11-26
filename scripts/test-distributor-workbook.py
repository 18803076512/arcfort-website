#!/usr/bin/env python3
"""Regress the narrow distributor workbook formula repair using only the standard library."""

from copy import copy
import importlib.util
from io import BytesIO
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from xml.etree import ElementTree
from zipfile import ZipFile


SCRIPT = Path(__file__).with_name("manage-distributor-workbook.py")
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("distributor_workbook", SCRIPT)
manager = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(manager)
EXPECTED = 'SUMPRODUCT(--(\'Product Lines\'!C7:C66<>""),--ISNUMBER(\'Product Lines\'!I7:I66))'
OLD = "COUNT('Product Lines'!I7:I66)"
PART = "xl/worksheets/sheet1.xml"
NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def xml_formula(formula):
    return formula.replace("&", "&amp;").replace("<", "&lt;").encode()


def rewrite_member(data, transform, decorate=False):
    output = BytesIO()
    with ZipFile(BytesIO(data)) as source, ZipFile(output, "w") as target:
        target.comment = b"Synthetic archive comment" if decorate else source.comment
        for member in source.infolist():
            info = copy(member)
            if decorate:
                info.comment = b"Synthetic member comment"
                info.extra = b"\xfe\xca\x03\x00RFQ"
                info.date_time = (2024, 2, 4, 6, 8, 10)
                info.internal_attr = 1
                info.external_attr = 0o100640 << 16
            payload = source.read(member)
            target.writestr(info, transform(payload) if member.filename == PART else payload)
    return output.getvalue()


class DistributorWorkbookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.shipped = manager.DEFAULT_WORKBOOK.read_bytes()
        cls.legacy = rewrite_member(
            cls.shipped, lambda part: part.replace(xml_formula(EXPECTED), xml_formula(OLD)),
        )

    def run_cli(self, path, *arguments):
        return subprocess.run(
            [sys.executable, str(SCRIPT), "--workbook", str(path), *arguments],
            capture_output=True, text=True, timeout=10,
        )

    def test_shipped_formula_and_existing_policy(self):
        self.assertEqual(manager.inspect_archive(self.shipped), EXPECTED)
        with ZipFile(BytesIO(self.shipped)) as archive:
            root = ElementTree.fromstring(archive.read(PART))
            formulas = {
                cell.attrib["r"]: cell.find("x:f", NS).text
                for cell in root.findall(".//x:c", NS) if cell.find("x:f", NS) is not None
            }
        self.assertEqual(formulas["B7"], "COUNTA('Product Lines'!C7:C66)")
        self.assertEqual(formulas["C8"], 'IF(OR(B7=0,B8=B7),"Ready","Add quantities")')

    def test_only_b8_changes_and_archive_metadata_is_preserved(self):
        before_data = rewrite_member(self.legacy, lambda part: part, decorate=True)
        after_data = manager.repair_archive(before_data)
        with ZipFile(BytesIO(before_data)) as before, ZipFile(BytesIO(after_data)) as after:
            self.assertEqual(before.comment, after.comment)
            self.assertEqual(before.namelist(), after.namelist())
            changed = []
            for original, repaired in zip(before.infolist(), after.infolist()):
                for attribute in manager.METADATA_FIELDS:
                    self.assertEqual(getattr(original, attribute), getattr(repaired, attribute), attribute)
                original_bytes, repaired_bytes = before.read(original), after.read(repaired)
                if original_bytes != repaired_bytes:
                    changed.append(original.filename)
                    self.assertEqual(
                        repaired_bytes,
                        original_bytes.replace(xml_formula(OLD), xml_formula(EXPECTED), 1),
                    )
                else:
                    self.assertEqual(original.CRC, repaired.CRC)
                    self.assertEqual(original.file_size, repaired.file_size)
            self.assertEqual(changed, [PART])
        self.assertEqual(manager.repair_archive(after_data), after_data)

    def test_default_and_explicit_check_never_write(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic.xlsx"
            for fixture, expected_status in [(self.legacy, 1), (self.shipped, 0)]:
                path.write_bytes(fixture)
                for arguments in [(), ("--check",)]:
                    before = path.stat()
                    result = self.run_cli(path, *arguments)
                    self.assertEqual(result.returncode, expected_status, result.stderr)
                    self.assertEqual(path.read_bytes(), fixture)
                    self.assertEqual(path.stat().st_mtime_ns, before.st_mtime_ns)
                    self.assertEqual(sorted(p.name for p in Path(directory).iterdir()), [path.name])

    def test_explicit_write_and_second_write_are_idempotent(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic.xlsx"
            path.write_bytes(self.legacy)
            path.chmod(0o640)
            result = self.run_cli(path, "--write")
            self.assertEqual(result.returncode, 0, result.stderr)
            repaired = path.read_bytes()
            self.assertEqual(manager.inspect_archive(repaired), EXPECTED)
            before = path.stat()
            self.assertEqual(before.st_mode & 0o777, 0o640)
            result = self.run_cli(path, "--write")
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertEqual(path.read_bytes(), repaired)
            self.assertEqual(path.stat().st_mtime_ns, before.st_mtime_ns)
            self.assertEqual(sorted(p.name for p in Path(directory).iterdir()), [path.name])

    def test_unexpected_or_missing_formulas_refuse_without_writing(self):
        changes = [
            (xml_formula(OLD), b"SUM(1,2)"),
            (b"<x:f>" + xml_formula(OLD) + b"</x:f>", b""),
            (xml_formula("COUNTA('Product Lines'!C7:C66)"), b"COUNTA(A1:A2)"),
            (xml_formula('IF(OR(B7=0,B8=B7),"Ready","Add quantities")'), b'IF(B8=B7,"Ready","Add quantities")'),
        ]
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic.xlsx"
            for old, new in changes:
                fixture = rewrite_member(self.legacy, lambda part: part.replace(old, new, 1))
                for arguments in [(), ("--check",), ("--write",)]:
                    path.write_bytes(fixture)
                    before = path.stat()
                    result = self.run_cli(path, *arguments)
                    self.assertEqual(result.returncode, 1, result.stdout)
                    self.assertIn("failed", result.stderr)
                    self.assertEqual(path.read_bytes(), fixture)
                    self.assertEqual(path.stat().st_mtime_ns, before.st_mtime_ns)
            self.assertEqual(sorted(p.name for p in Path(directory).iterdir()), [path.name])


if __name__ == "__main__":
    unittest.main(verbosity=2)
