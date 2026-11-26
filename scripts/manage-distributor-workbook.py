#!/usr/bin/env python3
"""Check or narrowly repair the distributor workbook's per-line quantity count."""

import argparse
from copy import copy
from io import BytesIO
import os
from pathlib import Path
import re
import stat
import sys
import tempfile
from xml.etree import ElementTree
from zipfile import BadZipFile, ZipFile


DEFAULT_WORKBOOK = (
    Path(__file__).resolve().parent.parent
    / "public/downloads/arcfort-distributor-rfq-workbook.xlsx"
)
SUMMARY_PART = "xl/worksheets/sheet1.xml"
NAMESPACE = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
OLD_QUANTITY_FORMULA = "COUNT('Product Lines'!I7:I66)"
QUANTITY_FORMULA = (
    'SUMPRODUCT(--(\'Product Lines\'!C7:C66<>""),'
    "--ISNUMBER('Product Lines'!I7:I66))"
)
POLICY_FORMULAS = {
    "B7": "COUNTA('Product Lines'!C7:C66)",
    "C8": 'IF(OR(B7=0,B8=B7),"Ready","Add quantities")',
}
METADATA_FIELDS = (
    "filename", "date_time", "compress_type", "comment", "extra", "create_system",
    "create_version", "extract_version", "reserved", "flag_bits", "volume",
    "internal_attr", "external_attr",
)


class WorkbookError(ValueError):
    """The workbook does not match the narrowly supported repair contract."""


def metadata(info):
    return tuple(getattr(info, field) for field in METADATA_FIELDS)


def quantity_formula(summary):
    root = ElementTree.fromstring(summary)
    formulas = {}
    for address in (*POLICY_FORMULAS, "B8"):
        cells = root.findall(f".//x:sheetData/x:row/x:c[@r='{address}']", NAMESPACE)
        if len(cells) != 1:
            raise WorkbookError(f"Expected exactly one summary cell {address}.")
        entries = cells[0].findall("x:f", NAMESPACE)
        if len(entries) != 1:
            raise WorkbookError(f"Expected exactly one formula in summary cell {address}.")
        formulas[address] = entries[0].text
    for address, expected in POLICY_FORMULAS.items():
        if formulas[address] != expected:
            raise WorkbookError(f"Unexpected summary formula in {address}; refusing repair.")
    if formulas["B8"] not in (OLD_QUANTITY_FORMULA, QUANTITY_FORMULA):
        raise WorkbookError("Unexpected summary formula in B8; refusing repair.")
    return formulas["B8"]


def inspect_archive(data):
    with ZipFile(BytesIO(data)) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)) or names.count(SUMMARY_PART) != 1:
            raise WorkbookError("Workbook must have unique members and one summary worksheet.")
        return quantity_formula(archive.read(SUMMARY_PART))


def repair_archive(data):
    """Return unchanged bytes when current; otherwise change only the known B8 formula."""
    if inspect_archive(data) == QUANTITY_FORMULA:
        return data
    with ZipFile(BytesIO(data)) as before:
        summary = before.read(SUMMARY_PART)
        # Do not serialize XML: that can alter namespaces, styles, cached values or layout.
        cell_pattern = rb'<(?:[A-Za-z_][\w.-]*:)?c\b[^>]*\br="B8"[^>]*>.*?</(?:[A-Za-z_][\w.-]*:)?c>'
        matches = list(re.finditer(cell_pattern, summary, re.DOTALL))
        if len(matches) != 1:
            raise WorkbookError("Cannot locate the supported B8 XML cell without rewriting XML.")
        cell = matches[0]
        old = OLD_QUANTITY_FORMULA.encode("utf-8")
        new = QUANTITY_FORMULA.replace("&", "&amp;").replace("<", "&lt;").encode("utf-8")
        formula_pattern = rb'(<(?:[A-Za-z_][\w.-]*:)?f>)([^<]*)(</(?:[A-Za-z_][\w.-]*:)?f>)'
        formulas = list(re.finditer(formula_pattern, cell.group(), re.DOTALL))
        if len(formulas) != 1 or formulas[0].group(2) != old:
            raise WorkbookError("Cannot replace the known B8 formula without rewriting its XML.")
        formula = formulas[0]
        start = cell.start() + formula.start(2)
        end = cell.start() + formula.end(2)
        updated_summary = summary[:start] + new + summary[end:]
        if quantity_formula(updated_summary) != QUANTITY_FORMULA:
            raise WorkbookError("Repaired summary did not pass formula verification.")
        output = BytesIO()
        with ZipFile(output, "w") as after:
            after.comment = before.comment
            for info in before.infolist():
                payload = updated_summary if info.filename == SUMMARY_PART else before.read(info)
                after.writestr(copy(info), payload)
        repaired = output.getvalue()
        with ZipFile(BytesIO(repaired)) as after:
            if before.comment != after.comment or before.namelist() != after.namelist():
                raise WorkbookError("Archive comment or member order changed; refusing repair.")
            for original, updated in zip(before.infolist(), after.infolist()):
                if metadata(original) != metadata(updated):
                    raise WorkbookError(f"ZIP metadata changed for {original.filename}; refusing repair.")
                expected = updated_summary if original.filename == SUMMARY_PART else before.read(original)
                if after.read(updated) != expected:
                    raise WorkbookError(f"Unexpected member change: {original.filename}.")
        return repaired


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true", help="Check without writing (default).")
    mode.add_argument("--write", action="store_true", help="Repair only the known old B8 formula.")
    parser.add_argument("--workbook", type=Path, default=DEFAULT_WORKBOOK)
    args = parser.parse_args(argv)
    temporary_path = None
    try:
        data = args.workbook.read_bytes()
        current = inspect_archive(data)
        if current == QUANTITY_FORMULA:
            print("Distributor workbook quantity formula is current.")
            return 0
        if not args.write:
            print("Distributor workbook has the old quantity formula; use --write to repair.", file=sys.stderr)
            return 1
        repaired = repair_archive(data)
        with tempfile.NamedTemporaryFile(dir=args.workbook.parent, delete=False) as output:
            temporary_path = Path(output.name)
            output.write(repaired)
        temporary_path.chmod(stat.S_IMODE(args.workbook.stat().st_mode))
        os.replace(temporary_path, args.workbook)
        temporary_path = None
        print("Repaired distributor workbook summary B8 only.")
        return 0
    except (OSError, BadZipFile, ElementTree.ParseError, WorkbookError) as error:
        print(f"Distributor workbook check failed: {error}", file=sys.stderr)
        return 1
    finally:
        if temporary_path is not None:
            temporary_path.unlink(missing_ok=True)


if __name__ == "__main__":
    sys.exit(main())
