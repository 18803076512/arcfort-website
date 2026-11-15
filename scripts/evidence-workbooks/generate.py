#!/usr/bin/env python3
"""Generate private, source-preserving factory review workbooks from governed CSV intake."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path

import xlsxwriter


ROOT = Path(__file__).resolve().parents[2]
INTAKE = ROOT / "data" / "intake"
INTERNAL_NOTE = "notes_internal"
CT0006 = "AF-MIG-CT-0006"
FIFTEEN_AK_SKUS = {
    "AF-MIG-CT-0004",
    "AF-MIG-CT-0005",
    "AF-MIG-TH-0007",
    "AF-MIG-GN-0008",
}
TECH_EVIDENCE_TYPES = (
    "factory_confirmation",
    "factory_specification",
    "drawing",
    "approved_sample",
    "verified_reference_number",
    "confirmed_dimensions",
    "measurement_record",
    "packaging_record",
)
TECH_STATUSES = (
    "CONFIRMED",
    "OEM_REFERENCE",
    "STANDARD_REFERENCE",
    "NEEDS_FACTORY_CONFIRMATION",
    "DATA_CONFLICT",
)
CT_STATUSES = ("NEEDS_FACTORY_CONFIRMATION", "CONFIRMED", "DATA_CONFLICT")
COMPONENT_IMAGE_STATUSES = ("requested", "received", "approved", "rejected", "blocked")
PRODUCT_IMAGE_STATUSES = ("requested", "received", "approved", "rejected")
CANDIDATE_IMAGE_STATUSES = ("requested", "received", "approved", "blocked")


@dataclass(frozen=True)
class SheetSpec:
    name: str
    csv_name: str
    id_field: str
    expected_count: int
    input_fields: tuple[str, ...]
    complete_fields: tuple[str, ...]
    status_lists: tuple[tuple[str, tuple[str, ...]], ...] = ()


ASSEMBLY = SheetSpec(
    "Assembly Confirmation",
    "15ak-series-confirmation.csv",
    "candidate_id",
    46,
    (
        "factory_product_name", "factory_sku", "factory_material", "factory_thread",
        "factory_dimensions", "factory_compatibility", "factory_packaging",
        "factory_moq", "factory_lead_time", "evidence_type", "evidence_reference",
        "verification_status", "verified_by", "verified_date", "image_request_status",
    ),
    ("factory_product_name", "factory_sku", "evidence_type", "evidence_reference", "verified_by", "verified_date"),
    (
        ("evidence_type", TECH_EVIDENCE_TYPES),
        ("verification_status", TECH_STATUSES),
        ("image_request_status", CANDIDATE_IMAGE_STATUSES),
    ),
)
COMPONENT_IMAGES = SheetSpec(
    "Component Images",
    "15ak-image-intake.csv",
    "request_id",
    58,
    ("source_owner", "usage_rights", "file_name", "review_status", "reviewed_by", "reviewed_date"),
    ("source_owner", "usage_rights", "file_name", "reviewed_by", "reviewed_date"),
    (("review_status", COMPONENT_IMAGE_STATUSES),),
)
PRODUCT_TECH = SheetSpec(
    "Product Technical",
    "15ak-technical-confirmation.csv",
    "record_id",
    15,
    ("confirmed_value", "confirmed_unit", "evidence_type", "evidence_reference", "verification_status", "verified_by", "verified_date"),
    ("confirmed_value", "evidence_type", "evidence_reference", "verified_by", "verified_date"),
    (("evidence_type", TECH_EVIDENCE_TYPES), ("verification_status", TECH_STATUSES)),
)
PRODUCT_IMAGES = SheetSpec(
    "Product Images",
    "15ak-product-image-intake.csv",
    "request_id",
    20,
    ("source_owner", "usage_rights", "file_name", "review_status", "reviewed_by", "reviewed_date"),
    ("source_owner", "usage_rights", "file_name", "reviewed_by", "reviewed_date"),
    (("review_status", PRODUCT_IMAGE_STATUSES),),
)
CT_TECH = SheetSpec(
    "Product Technical",
    "general-m6-27-contact-tip-technical-confirmation.csv",
    "record_id",
    4,
    PRODUCT_TECH.input_fields,
    PRODUCT_TECH.complete_fields,
    (("evidence_type", TECH_EVIDENCE_TYPES), ("verification_status", CT_STATUSES)),
)
FIFTEEN_AK_SHEETS = (ASSEMBLY, COMPONENT_IMAGES, PRODUCT_TECH, PRODUCT_IMAGES)
CT_SHEETS = (CT_TECH,)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_source(spec: SheetSpec) -> tuple[list[str], list[dict[str, str]], str]:
    path = INTAKE / spec.csv_name
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        columns = reader.fieldnames
        if not columns or len(set(columns)) != len(columns) or INTERNAL_NOTE not in columns:
            raise ValueError(f"Expected unique columns and {INTERNAL_NOTE}: {path}")
        if spec.id_field not in columns or not set(spec.input_fields) <= set(columns):
            raise ValueError(f"Missing review fields in {path}")
        rows = list(reader)
    if len(rows) != spec.expected_count or any(None in row for row in rows):
        raise ValueError(f"Unexpected row count or malformed CSV: {path}")
    ids = [row[spec.id_field] for row in rows]
    if any(not item for item in ids) or len(ids) != len(set(ids)):
        raise ValueError(f"Missing or duplicate {spec.id_field}: {path}")
    if spec is CT_TECH:
        if {row["sku"] for row in rows} != {CT0006}:
            raise ValueError("CT0006 intake must contain only the independent CT0006 SKU")
    elif "sku" in columns and any(row["sku"] not in FIFTEEN_AK_SKUS for row in rows):
        raise ValueError(f"CT0006 or an unexpected SKU appeared in {path}")
    elif spec in (ASSEMBLY, COMPONENT_IMAGES) and any(
        row["series_evidence_id"] != "mig-series-15ak" for row in rows
    ):
        raise ValueError(f"Unexpected series ID in {path}")
    return [column for column in columns if column != INTERNAL_NOTE], rows, sha256(path)


def formats(workbook: xlsxwriter.Workbook) -> dict[str, xlsxwriter.format.Format]:
    base = {"font_name": "Microsoft YaHei", "font_size": 10, "valign": "vcenter"}
    return {
        "title": workbook.add_format({**base, "font_size": 18, "bold": True, "font_color": "#FFFFFF", "bg_color": "#13304C"}),
        "subhead": workbook.add_format({**base, "font_size": 11, "bold": True, "font_color": "#173752", "bg_color": "#DCEAF2"}),
        "text": workbook.add_format({**base, "text_wrap": True, "font_color": "#20364A"}),
        "warning": workbook.add_format({**base, "text_wrap": True, "font_color": "#613C0B", "bg_color": "#FFF2D5"}),
        "link": workbook.add_format({**base, "font_color": "#075A95", "underline": True}),
        "number": workbook.add_format({**base, "font_color": "#173752", "num_format": "0"}),
        "header_source": workbook.add_format({**base, "bold": True, "text_wrap": True, "font_color": "#FFFFFF", "bg_color": "#394D62", "locked": True}),
        "header_input": workbook.add_format({**base, "bold": True, "text_wrap": True, "font_color": "#392500", "bg_color": "#EEC686", "locked": True}),
        "source": workbook.add_format({**base, "text_wrap": True, "font_color": "#334758", "bg_color": "#EEF2F5", "locked": True}),
        "input": workbook.add_format({**base, "text_wrap": True, "font_color": "#302C21", "bg_color": "#FFF0D9", "locked": False}),
        "input_date": workbook.add_format({**base, "font_color": "#302C21", "bg_color": "#FFF0D9", "num_format": "yyyy-mm-dd", "locked": False}),
    }


def column_width(name: str) -> int:
    if name in {"reference_summary", "requested_confirmation", "shot_guidance", "required_detail", "source_reference"}:
        return 48
    if name in {"evidence_reference", "factory_compatibility", "factory_dimensions", "variant_label"}:
        return 33
    if name.endswith("_id") or name in {"request_id", "candidate_id", "record_id", "target_path"}:
        return 31
    if name in {"reviewed_date", "verified_date", "sku", "factory_sku"}:
        return 22
    return 25


def visible_lines(value: str, width: int) -> int:
    """Estimate wrapped display lines so long source instructions remain readable in WPS/Excel."""
    if not value:
        return 1
    total = 0
    for line in value.splitlines() or [""]:
        units = sum(2 if unicodedata.east_asian_width(char) in "WF" else 1 for char in line)
        usable = max(width - 5, 1)
        total += max(1, (units + usable - 1) // usable)
    return total


def add_source_sheet(
    workbook: xlsxwriter.Workbook,
    spec: SheetSpec,
    style: dict[str, xlsxwriter.format.Format],
) -> dict[str, object]:
    columns, rows, source_hash = read_source(spec)
    worksheet = workbook.add_worksheet(spec.name)
    worksheet.set_tab_color("#D99030" if spec is CT_TECH else "#1B6B93")
    worksheet.set_zoom(90)
    worksheet.freeze_panes(1, 2 if "sku" in columns else 1)
    worksheet.set_row(0, 42)
    worksheet.set_default_row(34)
    worksheet.hide_gridlines(2)
    worksheet.set_landscape()
    worksheet.fit_to_pages(1, 0)
    worksheet.set_margins(0.25, 0.25, 0.45, 0.45)
    worksheet.set_header("&CArcFort Weld | PRIVATE REVIEW / 内部审核")
    worksheet.set_footer("&CPage &P of &N")
    for index, name in enumerate(columns):
        is_input = name in spec.input_fields
        worksheet.set_column(index, index, column_width(name))
        worksheet.write_string(0, index, name, style["header_input" if is_input else "header_source"])
        if name in {"verified_date", "reviewed_date"}:
            worksheet.write_comment(0, index, "请在 Excel/WPS 中填写日期；回传入库时转换为 YYYY-MM-DD。\nEnter a native date; export as ISO YYYY-MM-DD.")
    for row_index, row in enumerate(rows, start=1):
        lines = max(visible_lines(row[name], column_width(name)) for name in columns)
        worksheet.set_row(row_index, min(390, max(34, 18 * lines + 10)))
        for column_index, name in enumerate(columns):
            value = row[name]
            is_input = name in spec.input_fields
            cell_style = style["input_date" if is_input and name.endswith("_date") else "input" if is_input else "source"]
            if value:
                # Explicit strings and workbook options prevent CSV text from becoming a formula or URL.
                worksheet.write_string(row_index, column_index, value, cell_style)
            else:
                worksheet.write_blank(row_index, column_index, None, cell_style)
    for field, choices in spec.status_lists:
        column = columns.index(field)
        worksheet.data_validation(1, column, len(rows), column, {
            "validate": "list", "source": list(choices), "ignore_blank": True,
            "input_title": "审核输入 / Reviewer input",
            "input_message": "仅填候选状态；实际发布仍需权威资料复核。",
            "error_title": "状态无效 / Invalid status", "error_message": "请选择列表中的状态。",
            "error_type": "stop",
        })
    for name in ("verified_date", "reviewed_date"):
        if name in spec.input_fields:
            column = columns.index(name)
            worksheet.data_validation(1, column, len(rows), column, {
                "validate": "date", "criteria": "between",
                "minimum": datetime(2000, 1, 1), "maximum": datetime(2100, 12, 31),
                "ignore_blank": True, "input_title": "审核日期 / Review date",
                "input_message": "请选择实际审核日期，回传时使用 YYYY-MM-DD。",
                "error_title": "日期无效 / Invalid date", "error_message": "请输入有效日期。",
                "error_type": "stop",
            })
    worksheet.autofilter(0, 0, len(rows), len(columns) - 1)
    worksheet.protect("", {"autofilter": True, "sort": True, "format_rows": True, "select_locked_cells": True, "select_unlocked_cells": True})
    return {
        "source": f"data/intake/{spec.csv_name}",
        "source_sha256": source_hash,
        "sheet": spec.name,
        "row_count": len(rows),
        "id_field": spec.id_field,
        "columns": columns,
        "row_by_id": {row[spec.id_field]: position for position, row in enumerate(rows, start=2)},
        "fields_complete_check": list(spec.complete_fields),
    }


def complete_formula(spec: SheetSpec, columns: list[str], row_count: int) -> str:
    ranges = [
        f"'{spec.name}'!${xlsxwriter.utility.xl_col_to_name(columns.index(field))}$2:${xlsxwriter.utility.xl_col_to_name(columns.index(field))}${row_count + 1}"
        for field in spec.complete_fields
    ]
    args = ",".join(f'{cell_range},"<>"' for cell_range in ranges)
    if "reference_unit" in columns and "confirmed_unit" in columns:
        reference_unit = f"'{spec.name}'!${xlsxwriter.utility.xl_col_to_name(columns.index('reference_unit'))}$2:${xlsxwriter.utility.xl_col_to_name(columns.index('reference_unit'))}${row_count + 1}"
        confirmed_unit = f"'{spec.name}'!${xlsxwriter.utility.xl_col_to_name(columns.index('confirmed_unit'))}$2:${xlsxwriter.utility.xl_col_to_name(columns.index('confirmed_unit'))}${row_count + 1}"
        return f'=COUNTIFS({args},{reference_unit},"")+COUNTIFS({args},{reference_unit},"<>",{confirmed_unit},"<>")'
    return f"=COUNTIFS({args})"


def add_start_here(
    workbook: xlsxwriter.Workbook,
    style: dict[str, xlsxwriter.format.Format],
    specs: tuple[SheetSpec, ...],
    metadata: list[dict[str, object]],
    as_of: date,
    is_ct: bool,
) -> None:
    ws = workbook.add_worksheet("Start Here")
    ws.set_tab_color("#D99030")
    ws.hide_gridlines(2)
    ws.set_zoom(105)
    ws.set_column("A:A", 34)
    ws.set_column("B:B", 17)
    ws.set_column("C:C", 32)
    ws.set_column("D:F", 25)
    ws.set_default_row(30)
    ws.merge_range("A1:F2", "CT0006 独立目录参考审核 | Independent Reference Intake" if is_ct else "15AK 工厂证据审核 | Factory Evidence Intake", style["title"])
    ws.merge_range("A3:F3", f"内部工作文件 / Private reviewer workbook · 数据快照 {as_of.isoformat()} · 目录值仅作参考 / Catalog values are references only", style["warning"])
    steps = (
        [
            "第一步：只审核 AF-MIG-CT-0006 实物或准确变体；不得套用 15AK 接触嘴的 25 mm 目录参考。",
            "First: identify the exact CT0006 physical item; do not reuse the 15AK contact-tip reference.",
            "逐字段提供实物、受控图纸或测量记录，核对线径、总长、螺纹和配套导电嘴座。",
            "Provide evidence reference, reviewer and actual review date. Keep disagreements as DATA_CONFLICT.",
        ] if is_ct else [
            "第一步：先审四款准确 SKU 的「Product Technical」与「Product Images」，逐项提交实物/图纸/测量与原图。",
            "First: review the four exact SKUs in Product Technical and Product Images; retain each SKU and stable row ID.",
            "第二步：再审 46 条组件候选及 58 条组件图片；相似名称不能证明它属于上述四款 SKU。",
            "Then review 46 assembly candidates and 58 component images; catalog grouping does not prove exact SKU fit.",
        ]
    )
    for row_index, line in enumerate(steps, start=4):
        ws.merge_range(row_index, 0, row_index, 5, line, style["text"])
        ws.set_row(row_index, 36)
    ws.merge_range("A9:F9", "审核边界 / Review boundary", style["subhead"])
    boundaries = [
        "橙色单元格供审阅人填写；灰色来源栏与稳定 ID 请勿改动。保护仅防误改，不是安全控制。",
        "需保留原始图片、来源人、网站使用权依据、同款实物/变体证据、审核人和日期。",
        "目录值、图片相似或本文件填写完整都不表示已确认、获授权或可发布。冲突保留 DATA_CONFLICT。",
        "回传工作簿及原件后，按稳定 ID 逐字段人工核对；原生日期转 ISO YYYY-MM-DD 才可入权威 CSV。",
    ]
    for row_index, line in enumerate(boundaries, start=9):
        ws.merge_range(row_index, 0, row_index, 5, line, style["warning" if row_index == 11 else "text"])
        ws.set_row(row_index, 36)
    headers = ["审核表 / Sheet", "行数 / Rows", "字段齐全待人工复核 / Fields complete, review pending", "权威状态 / Authority"]
    for col_index, label in enumerate(headers):
        ws.write_string(14, col_index, label, style["header_source"])
    ws.set_row(14, 42)
    for row_index, (spec, info) in enumerate(zip(specs, metadata, strict=True), start=15):
        ws.write_url(row_index, 0, f"internal:'{spec.name}'!A1", style["link"], spec.name)
        ws.write_number(row_index, 1, spec.expected_count, style["number"])
        _, source_rows, _ = read_source(spec)
        cached_complete = sum(
            all(row[field].strip() for field in spec.complete_fields)
            and (not row.get("reference_unit", "").strip() or bool(row.get("confirmed_unit", "").strip()))
            for row in source_rows
        )
        ws.write_formula(row_index, 2, complete_formula(spec, info["columns"], spec.expected_count), style["number"], cached_complete)
        ws.write_string(row_index, 3, "仅供人工核对 / Intake only", style["text"])
    ws.merge_range(21, 0, 21, 5, "CT0006 必须单独审核，不得套用 15AK 接触嘴参考或直接改变页面/报价。" if not is_ct else "CT0006 审核结果只进入独立队列；15AK 四款、图片权益与适配关系分别审核。", style["warning"])
    ws.set_row(21, 40)
    ws.protect("", {"select_locked_cells": True, "select_unlocked_cells": True})
    ws.set_landscape()
    ws.fit_to_pages(1, 1)


def create_workbook(path: Path, specs: tuple[SheetSpec, ...], as_of: date, is_ct: bool) -> list[dict[str, object]]:
    workbook = xlsxwriter.Workbook(str(path), {"strings_to_formulas": False, "strings_to_urls": False})
    workbook.set_properties({
        "title": "ArcFort Weld CT0006 Independent Evidence Intake" if is_ct else "ArcFort Weld 15AK Evidence Intake",
        "subject": "Private factory and product evidence collection; no publication decision",
        "author": "ArcFort Weld",
        "company": "Renqiu Ailesen Welding Technology Co., Ltd.",
        "comments": "Source references and reviewer fields only. A completed workbook is not approval.",
        "created": datetime(as_of.year, as_of.month, as_of.day),
    })
    style = formats(workbook)
    # Keep the instruction sheet first while source sheets retain unmodified canonical headers.
    metadata = [add_source_sheet(workbook, spec, style) for spec in specs]
    add_start_here(workbook, style, specs, metadata, as_of, is_ct)
    workbook.worksheets_objs.insert(0, workbook.worksheets_objs.pop())
    workbook.close()
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--as-of", required=True, help="Snapshot date YYYY-MM-DD; fixes workbook metadata")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "outputs")
    args = parser.parse_args()
    as_of = date.fromisoformat(args.as_of)
    output = args.output_dir.resolve()
    output.mkdir(parents=True, exist_ok=True)
    products = [
        ("15ak", "ArcFort-Weld-15AK-Evidence-Intake.xlsx", FIFTEEN_AK_SHEETS, False),
        ("ct0006", "ArcFort-Weld-CT0006-Evidence-Intake.xlsx", CT_SHEETS, True),
    ]
    manifest: dict[str, object] = {
        "schema_version": 1,
        "as_of": as_of.isoformat(),
        "publication_performed": False,
        "external_write_performed": False,
        "authority": "Private reviewer intake only; repository CSV and reviewed registries remain authoritative",
        "workbooks": {},
    }
    for key, name, specs, is_ct in products:
        path = output / name
        metadata = create_workbook(path, specs, as_of, is_ct)
        manifest["workbooks"][key] = {"file": name, "sha256": sha256(path), "sheets": metadata}
    manifest_path = output / "evidence-workbooks-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print(f"Generated {len(products)} private workbooks and {manifest_path}")


if __name__ == "__main__":
    main()
