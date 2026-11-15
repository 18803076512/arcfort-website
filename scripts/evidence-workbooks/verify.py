#!/usr/bin/env python3
"""Independently read back private evidence workbooks and compare them with canonical CSVs."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

import openpyxl


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data" / "intake"
EXPECTED = {
    "15ak": {
        "file": "ArcFort-Weld-15AK-Evidence-Intake.xlsx",
        "sheets": [
            ("Assembly Confirmation", "15ak-series-confirmation.csv", "candidate_id", 46),
            ("Component Images", "15ak-image-intake.csv", "request_id", 58),
            ("Product Technical", "15ak-technical-confirmation.csv", "record_id", 15),
            ("Product Images", "15ak-product-image-intake.csv", "request_id", 20),
        ],
    },
    "ct0006": {
        "file": "ArcFort-Weld-CT0006-Evidence-Intake.xlsx",
        "sheets": [
            ("Product Technical", "general-m6-27-contact-tip-technical-confirmation.csv", "record_id", 4),
        ],
    },
}
REVIEW_FIELDS = {
    "Assembly Confirmation": {
        "factory_product_name", "factory_sku", "factory_material", "factory_thread",
        "factory_dimensions", "factory_compatibility", "factory_packaging",
        "factory_moq", "factory_lead_time", "evidence_type", "evidence_reference",
        "verification_status", "verified_by", "verified_date", "image_request_status",
    },
    "Component Images": {"source_owner", "usage_rights", "file_name", "review_status", "reviewed_by", "reviewed_date"},
    "Product Technical": {"confirmed_value", "confirmed_unit", "evidence_type", "evidence_reference", "verification_status", "verified_by", "verified_date"},
    "Product Images": {"source_owner", "usage_rights", "file_name", "review_status", "reviewed_by", "reviewed_date"},
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        require(reader.fieldnames is not None, f"Missing CSV headers: {path}")
        columns = [name for name in reader.fieldnames if name != "notes_internal"]
        rows = list(reader)
    return columns, rows


def validation_covers(sheet: openpyxl.worksheet.worksheet.Worksheet, kind: str, column: int) -> bool:
    return any(
        validation.type == kind
        and any(
            cell_range.min_col <= column <= cell_range.max_col
            and cell_range.min_row <= 2 <= cell_range.max_row
            for cell_range in validation.ranges
        )
        for validation in sheet.data_validations.dataValidation
    )


def verify_sheet(
    sheet: openpyxl.worksheet.worksheet.Worksheet,
    spec: tuple[str, str, str, int],
    metadata: dict[str, object],
    workbook_key: str,
) -> None:
    name, csv_name, id_field, expected_count = spec
    source_path = SOURCE / csv_name
    columns, source_rows = read_csv(source_path)
    require(len(source_rows) == expected_count, f"Source count drift: {csv_name}")
    require(sheet.max_row == expected_count + 1, f"Workbook row count drift: {name}")
    require(sheet.max_column == len(columns), f"Workbook column count drift: {name}")
    require(sheet.protection.sheet, f"Source editing guard absent: {name}")
    require(sheet.freeze_panes is not None and sheet.auto_filter.ref, f"Review navigation absent: {name}")
    require([sheet.cell(1, index).value for index in range(1, len(columns) + 1)] == columns, f"Header drift: {name}")
    require("notes_internal" not in columns, f"Internal notes leaked: {name}")
    require(metadata["source"] == f"data/intake/{csv_name}", f"Manifest source drift: {name}")
    require(metadata["source_sha256"] == sha256(source_path), f"Manifest source hash drift: {name}")
    require(metadata["columns"] == columns, f"Manifest column drift: {name}")
    require(metadata["row_count"] == expected_count and metadata["id_field"] == id_field, f"Manifest identity drift: {name}")
    require(set(REVIEW_FIELDS[name]) <= set(columns), f"Expected review inputs missing: {name}")
    require(validation_covers(sheet, "date", columns.index("verified_date" if "verified_date" in columns else "reviewed_date") + 1), f"Native date validation missing: {name}")
    for status in ("verification_status", "review_status", "image_request_status"):
        if status in columns and status in REVIEW_FIELDS[name]:
            require(validation_covers(sheet, "list", columns.index(status) + 1), f"Status dropdown missing: {name}.{status}")
    if "evidence_type" in columns:
        require(validation_covers(sheet, "list", columns.index("evidence_type") + 1), f"Evidence dropdown missing: {name}")
    source_values = {
        value
        for row in source_rows
        for field, value in row.items()
        if field != "notes_internal" and value
    }
    hidden_notes = {
        row.get("notes_internal", "")
        for row in source_rows
        if row.get("notes_internal") and row["notes_internal"] not in source_values
    }
    workbook_values: set[str] = set()
    ids: list[str] = []
    for excel_row, source_row in enumerate(source_rows, start=2):
        ids.append(source_row[id_field])
        for excel_column, field in enumerate(columns, start=1):
            cell = sheet.cell(excel_row, excel_column)
            expected_value = source_row[field] or None
            require(cell.value == expected_value, f"Round-trip mismatch at {name}!{cell.coordinate}: {field}")
            require(cell.data_type != "f" and cell.hyperlink is None, f"Source text activated as formula or URL: {name}!{cell.coordinate}")
            if isinstance(cell.value, str):
                workbook_values.add(cell.value)
            unlocked = field in REVIEW_FIELDS[name]
            require(cell.protection.locked is not unlocked, f"Source/input locking drift at {name}!{cell.coordinate}")
        if workbook_key == "15ak" and "sku" in source_row:
            require(source_row["sku"] != "AF-MIG-CT-0006", f"CT0006 crossed the 15AK boundary: {name}")
        if workbook_key == "ct0006":
            require(source_row["sku"] == "AF-MIG-CT-0006", "Non-CT0006 SKU crossed the separate intake boundary")
    require(not hidden_notes.intersection(workbook_values), f"Internal note content leaked: {name}")
    require(len(set(ids)) == expected_count and all(ids), f"Missing or duplicate stable IDs: {name}")
    require(metadata["row_by_id"] == {item: index for index, item in enumerate(ids, start=2)}, f"Manifest row map drift: {name}")


def verify(output: Path) -> None:
    manifest_path = output / "evidence-workbooks-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    require(manifest["schema_version"] == 1, "Unsupported manifest version")
    require(manifest["publication_performed"] is False, "Artifact must not claim publication")
    require(manifest["external_write_performed"] is False, "Artifact must not claim an external write")
    require(set(manifest["workbooks"]) == set(EXPECTED), "Workbook inventory drift")
    for key, expected in EXPECTED.items():
        item = manifest["workbooks"][key]
        path = output / expected["file"]
        require(item["file"] == expected["file"] and path.is_file(), f"Workbook missing: {key}")
        require(item["sha256"] == sha256(path), f"Workbook hash drift: {key}")
        workbook = openpyxl.load_workbook(path, data_only=False, keep_links=True)
        sheet_specs = expected["sheets"]
        require(workbook.sheetnames == ["Start Here", *[entry[0] for entry in sheet_specs]], f"Sheet boundary/order drift: {key}")
        require(not workbook._external_links, f"External workbook link in {key}")
        start = workbook["Start Here"]
        require(start["C15"].value == "字段齐全待人工复核 / Fields complete, review pending", f"Review-ready metric mislabeled: {key}")
        require(len(item["sheets"]) == len(sheet_specs), f"Manifest sheet count drift: {key}")
        for row, (spec, metadata) in enumerate(zip(sheet_specs, item["sheets"], strict=True), start=16):
            require(metadata["sheet"] == spec[0], f"Manifest sheet name drift: {key}")
            verify_sheet(workbook[spec[0]], spec, metadata, key)
            require(start[f"C{row}"].data_type == "f", f"Fields-complete formula absent: {key}/{spec[0]}")
        workbook.close()
    with tempfile.TemporaryDirectory(prefix="arcfort-workbook-verify-") as temporary:
        command = [
            sys.executable, str(Path(__file__).with_name("generate.py")),
            "--as-of", manifest["as_of"], "--output-dir", temporary,
        ]
        subprocess.run(command, cwd=ROOT, check=True, capture_output=True, text=True)
        for name in [*(entry["file"] for entry in manifest["workbooks"].values()), manifest_path.name]:
            require((output / name).read_bytes() == (Path(temporary) / name).read_bytes(), f"Repeat generation differs: {name}")
    print("PASS: 139 15AK rows and 4 separate CT0006 rows round-trip with stable IDs, source/status parity, no internal notes, and byte-identical regeneration.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "outputs")
    args = parser.parse_args()
    verify(args.output_dir.resolve())
