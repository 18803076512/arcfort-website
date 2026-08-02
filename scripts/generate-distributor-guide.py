#!/usr/bin/env python3

import csv
import shutil
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from PIL import Image as PillowImage


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PDF = ROOT / "output" / "pdf" / "arcfort-distributor-sourcing-guide.pdf"
PUBLIC_PDF = ROOT / "public" / "downloads" / "arcfort-distributor-sourcing-guide.pdf"
CAMPAIGN_CSV = ROOT / "data" / "promotion" / "campaigns.csv"
HERO_IMAGE = ROOT / "public" / "images" / "site" / "arcfort-oem-consumables-workbench.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 42
MIDNIGHT = HexColor("#071524")
BLUE = HexColor("#0B4E8A")
LIGHT_BLUE = HexColor("#EAF3FA")
SIGNAL = HexColor("#F0A202")
SLATE = HexColor("#465568")
LIGHT_SLATE = HexColor("#D8E0E8")
PAPER = HexColor("#F6F8FA")
PDF_ASSET_DIR = OUTPUT_PDF.parent / ".assets"

PRODUCT_IMAGES = [
    (
        "MIG/MAG Contact Tips",
        ROOT / "public" / "images" / "products" / "mig-contact-tip-m6-1-0mm.jpg",
    ),
    (
        "TIG Ceramic Cups",
        ROOT / "public" / "images" / "products" / "tig-ceramic-cup-5.jpg",
    ),
    (
        "Plasma Electrodes",
        ROOT / "public" / "images" / "products" / "plasma-electrode.jpg",
    ),
    (
        "Welding Accessories",
        ROOT / "public" / "images" / "products" / "ground-clamp.jpg",
    ),
]

CATEGORIES = [
    (
        "MIG/MAG Torch Parts",
        "Contact tips, gas nozzles, diffusers, liners and torch-front replacement parts.",
    ),
    (
        "TIG Torch Parts",
        "Ceramic cups, collets, collet bodies, gas lenses and related torch components.",
    ),
    (
        "Plasma Cutting Consumables",
        "Electrodes, nozzles, swirl rings, shields and consumable-stack components.",
    ),
    (
        "Welding Consumables",
        "Welding wires, electrodes, holders and general industrial consumable supply.",
    ),
    (
        "Welding Machines",
        "MIG, TIG, MMA and plasma cutting equipment for quotation-based sourcing.",
    ),
    (
        "Welding Accessories",
        "Cables, connectors, clamps, holders and workshop replacement accessories.",
    ),
]


def load_tracking_url(campaign_id: str) -> str:
    with CAMPAIGN_CSV.open("r", encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))

    row = next((item for item in rows if item.get("id") == campaign_id), None)
    if not row:
        raise ValueError(f"Campaign id not found: {campaign_id}")

    base_url = "https://www.arcfortweld.com"
    split = urlsplit(urljoin(base_url, row["landing_path"]))
    query = parse_qsl(split.query, keep_blank_values=True)
    query.extend(
        [
            ("utm_source", row["source"]),
            ("utm_medium", row["medium"]),
            ("utm_campaign", row["campaign"]),
            ("utm_content", row["content"]),
        ]
    )
    return urlunsplit((split.scheme, split.netloc, split.path, urlencode(query), split.fragment))


def wrap_text(text: str, font_name: str, font_size: float, max_width: float):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        candidate = f"{current} {word}".strip()
        if not current or stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word

    if current:
        lines.append(current)
    return lines


def draw_paragraph(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    width: float,
    font_name: str = "Helvetica",
    font_size: float = 9.5,
    leading: float = 14,
    color=SLATE,
    max_lines: int | None = None,
):
    lines = wrap_text(text, font_name, font_size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color)
    for line in lines:
        pdf.drawString(x, y, line)
        y -= leading
    return y


def draw_image_cover(pdf: canvas.Canvas, image_path: Path, x: float, y: float, w: float, h: float):
    image = ImageReader(str(image_path))
    image_width, image_height = image.getSize()
    scale = max(w / image_width, h / image_height)
    draw_width = image_width * scale
    draw_height = image_height * scale
    draw_x = x + (w - draw_width) / 2
    draw_y = y + (h - draw_height) / 2

    pdf.saveState()
    clip = pdf.beginPath()
    clip.rect(x, y, w, h)
    pdf.clipPath(clip, stroke=0, fill=0)
    pdf.drawImage(image, draw_x, draw_y, draw_width, draw_height, mask="auto")
    pdf.restoreState()


def prepare_pdf_image(source_path: Path, max_width: int, quality: int = 85) -> Path:
    PDF_ASSET_DIR.mkdir(parents=True, exist_ok=True)
    output_path = PDF_ASSET_DIR / f"{source_path.stem}-{max_width}.jpg"

    with PillowImage.open(source_path) as source:
        image = source.convert("RGB")
        if image.width > max_width:
            target_height = round(image.height * max_width / image.width)
            image = image.resize((max_width, target_height), PillowImage.Resampling.LANCZOS)
        image.save(output_path, "JPEG", quality=quality, optimize=True, progressive=True)

    return output_path


def draw_page_header(pdf: canvas.Canvas, section: str, page_number: int):
    pdf.setFillColor(MIDNIGHT)
    pdf.rect(0, PAGE_HEIGHT - 34, PAGE_WIDTH, 34, stroke=0, fill=1)
    pdf.setFillColor(SIGNAL)
    pdf.rect(0, PAGE_HEIGHT - 34, 8, 34, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(white)
    pdf.drawString(MARGIN, PAGE_HEIGHT - 22, "ARCFORT WELD")
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(HexColor("#C8D5E2"))
    pdf.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 22, section.upper())
    pdf.setStrokeColor(LIGHT_SLATE)
    pdf.line(MARGIN, 32, PAGE_WIDTH - MARGIN, 32)
    pdf.setFont("Helvetica", 7.5)
    pdf.setFillColor(SLATE)
    pdf.drawString(MARGIN, 19, "Renqiu Ailesen Welding Technology Co., Ltd.")
    pdf.drawRightString(PAGE_WIDTH - MARGIN, 19, f"{page_number} / 4")


def draw_qr(pdf: canvas.Canvas, value: str, x: float, y: float, size: float):
    qr = QrCodeWidget(value)
    bounds = qr.getBounds()
    width = bounds[2] - bounds[0]
    height = bounds[3] - bounds[1]
    drawing = Drawing(size, size, transform=[size / width, 0, 0, size / height, 0, 0])
    drawing.add(qr)
    renderPDF.draw(drawing, pdf, x, y)
    pdf.linkURL(value, (x, y, x + size, y + size), relative=0)


def draw_cover(pdf: canvas.Canvas, hero_image: Path):
    pdf.setFillColor(MIDNIGHT)
    pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)
    draw_image_cover(pdf, hero_image, 0, 0, PAGE_WIDTH, 320)
    pdf.setFillColor(BLUE)
    pdf.rect(0, 320, PAGE_WIDTH, 32, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 8)
    pdf.setFillColor(white)
    pdf.drawCentredString(
        PAGE_WIDTH / 2,
        331,
        "MIG/MAG TORCH PARTS  |  TIG TORCH PARTS  |  PLASMA CUTTING CONSUMABLES  |  OEM SUPPLY",
    )

    pdf.setFillColor(SIGNAL)
    pdf.rect(MARGIN, PAGE_HEIGHT - 92, 74, 5, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.setFillColor(white)
    pdf.drawString(MARGIN, PAGE_HEIGHT - 72, "ARCFORT WELD")
    pdf.setFont("Helvetica", 8)
    pdf.setFillColor(HexColor("#C8D5E2"))
    pdf.drawString(MARGIN, PAGE_HEIGHT - 108, "INDUSTRIAL WELDING & CUTTING SOLUTIONS")

    y = PAGE_HEIGHT - 174
    pdf.setFont("Helvetica-Bold", 31)
    pdf.setFillColor(white)
    for line in ["Distributor", "Sourcing Guide"]:
        pdf.drawString(MARGIN, y, line)
        y -= 38

    y -= 10
    y = draw_paragraph(
        pdf,
        "Welding torch parts, plasma cutting consumables, welding products and OEM supply for international distributors, importers and industrial buyers.",
        MARGIN,
        y,
        310,
        font_size=12,
        leading=18,
        color=HexColor("#DCE7F0"),
    )

    y -= 20
    pdf.setFillColor(HexColor("#13283A"))
    pdf.rect(MARGIN, y - 106, PAGE_WIDTH - MARGIN * 2, 106, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.setFillColor(SIGNAL)
    pdf.drawString(MARGIN + 16, y - 22, "COMPANY")
    pdf.setFont("Helvetica", 9)
    pdf.setFillColor(white)
    pdf.drawString(MARGIN + 16, y - 40, "Renqiu Ailesen Welding Technology Co., Ltd.")
    pdf.drawString(MARGIN + 16, y - 60, "Renqiu City, Cangzhou, Hebei Province, China")
    pdf.drawString(MARGIN + 16, y - 80, "arcfortweld@outlook.com  |  +86-18803076512")

    pdf.setFillColor(MIDNIGHT)
    pdf.rect(0, 0, PAGE_WIDTH, 30, stroke=0, fill=1)
    pdf.setFont("Helvetica", 7.5)
    pdf.setFillColor(HexColor("#D7E1EA"))
    pdf.drawString(MARGIN, 11, "www.arcfortweld.com  |  Prepared for B2B sourcing discussion")
    pdf.showPage()


def draw_product_scope(pdf: canvas.Canvas, product_images: list[tuple[str, Path]]):
    draw_page_header(pdf, "Product Scope", 2)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.setFillColor(MIDNIGHT)
    pdf.drawString(MARGIN, PAGE_HEIGHT - 78, "Build one RFQ across six product families")
    draw_paragraph(
        pdf,
        "Use product names, current-part references, photos, drawings and quantities to keep every requested line traceable. Exact fit and unconfirmed technical details are reviewed before quotation.",
        MARGIN,
        PAGE_HEIGHT - 103,
        PAGE_WIDTH - MARGIN * 2,
        font_size=9.5,
        leading=14,
    )

    card_width = (PAGE_WIDTH - MARGIN * 2 - 14) / 2
    card_height = 83
    start_y = PAGE_HEIGHT - 170
    for index, (title, description) in enumerate(CATEGORIES):
        column = index % 2
        row = index // 2
        x = MARGIN + column * (card_width + 14)
        y = start_y - row * (card_height + 10) - card_height
        pdf.setFillColor(PAPER)
        pdf.setStrokeColor(LIGHT_SLATE)
        pdf.rect(x, y, card_width, card_height, stroke=1, fill=1)
        pdf.setFillColor(SIGNAL)
        pdf.rect(x, y, 5, card_height, stroke=0, fill=1)
        pdf.setFont("Helvetica-Bold", 11)
        pdf.setFillColor(MIDNIGHT)
        pdf.drawString(x + 16, y + card_height - 24, title)
        draw_paragraph(pdf, description, x + 16, y + card_height - 43, card_width - 30, font_size=8.3, leading=12)

    image_y = 58
    image_h = 242
    image_gap = 8
    image_w = (PAGE_WIDTH - MARGIN * 2 - image_gap * 3) / 4
    for index, (caption, image_path) in enumerate(product_images):
        x = MARGIN + index * (image_w + image_gap)
        draw_image_cover(pdf, image_path, x, image_y + 24, image_w, image_h - 24)
        pdf.setFillColor(MIDNIGHT)
        pdf.rect(x, image_y, image_w, 24, stroke=0, fill=1)
        pdf.setFont("Helvetica-Bold", 7.4)
        pdf.setFillColor(white)
        pdf.drawCentredString(x + image_w / 2, image_y + 8, caption)
    pdf.showPage()


def draw_sourcing_process(pdf: canvas.Canvas):
    draw_page_header(pdf, "Sourcing Process", 3)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.setFillColor(MIDNIGHT)
    pdf.drawString(MARGIN, PAGE_HEIGHT - 78, "From product list to reviewed quotation")
    draw_paragraph(
        pdf,
        "A structured inquiry helps both sides separate confirmed requirements from details that still need sample, drawing or model review.",
        MARGIN,
        PAGE_HEIGHT - 103,
        PAGE_WIDTH - MARGIN * 2,
        font_size=9.5,
        leading=14,
    )

    steps = [
        ("01", "Send product list", "Share references, quantities, destination and available evidence."),
        ("02", "Confirm details", "Review fit, dimensions, packing and any open technical fields."),
        ("03", "Review quotation", "Check items, MOQ, lead time, payment basis and delivery plan."),
        ("04", "Plan orders", "Keep approved references and packaging details for repeat purchasing."),
    ]
    step_y = PAGE_HEIGHT - 205
    step_width = (PAGE_WIDTH - MARGIN * 2 - 24) / 4
    for index, (number, title, description) in enumerate(steps):
        x = MARGIN + index * (step_width + 8)
        pdf.setFillColor(LIGHT_BLUE)
        pdf.rect(x, step_y - 116, step_width, 116, stroke=0, fill=1)
        pdf.setFillColor(BLUE)
        pdf.rect(x, step_y - 4, step_width, 4, stroke=0, fill=1)
        pdf.setFont("Helvetica-Bold", 20)
        pdf.setFillColor(BLUE)
        pdf.drawString(x + 12, step_y - 30, number)
        pdf.setFont("Helvetica-Bold", 9.2)
        pdf.setFillColor(MIDNIGHT)
        pdf.drawString(x + 12, step_y - 50, title)
        draw_paragraph(pdf, description, x + 12, step_y - 68, step_width - 24, font_size=7.7, leading=11)

    panel_y = 350
    pdf.setFillColor(MIDNIGHT)
    pdf.rect(MARGIN, panel_y, PAGE_WIDTH - MARGIN * 2, 165, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.setFillColor(white)
    pdf.drawString(MARGIN + 20, panel_y + 130, "OEM and private label review")
    draw_paragraph(
        pdf,
        "Available services can include product customization, logo printing, private label packaging, carton design and model customization. Send artwork, quantities, packaging format and product references for feasibility and MOQ review.",
        MARGIN + 20,
        panel_y + 106,
        PAGE_WIDTH - MARGIN * 2 - 40,
        font_size=9.2,
        leading=14,
        color=HexColor("#DCE7F0"),
    )
    pdf.setFont("Helvetica-Bold", 8)
    pdf.setFillColor(SIGNAL)
    pdf.drawString(MARGIN + 20, panel_y + 30, "LOGO  |  PACKAGING  |  PRIVATE LABEL  |  CARTON  |  MODEL CUSTOMIZATION")

    terms = [
        ("Main port", "Tianjin Xingang Port / Tianjin Port, China"),
        ("Payment", "T/T preferred: 30% deposit, 70% balance before shipment"),
        ("MOQ", "Small trial orders accepted; OEM MOQ depends on product and packaging"),
        ("Lead time", "Usually 7-20 working days for regular orders"),
    ]
    pdf.setFont("Helvetica-Bold", 16)
    pdf.setFillColor(MIDNIGHT)
    pdf.drawString(MARGIN, 310, "Commercial reference for RFQ planning")
    y = 282
    for label, value in terms:
        pdf.setFillColor(PAPER)
        pdf.rect(MARGIN, y - 35, PAGE_WIDTH - MARGIN * 2, 35, stroke=0, fill=1)
        pdf.setFont("Helvetica-Bold", 8.5)
        pdf.setFillColor(BLUE)
        pdf.drawString(MARGIN + 12, y - 21, label.upper())
        pdf.setFont("Helvetica", 8.5)
        pdf.setFillColor(SLATE)
        pdf.drawString(MARGIN + 104, y - 21, value)
        y -= 42
    pdf.showPage()


def draw_rfq_checklist(pdf: canvas.Canvas, tracking_url: str):
    draw_page_header(pdf, "RFQ Checklist", 4)
    pdf.setFont("Helvetica-Bold", 24)
    pdf.setFillColor(MIDNIGHT)
    pdf.drawString(MARGIN, PAGE_HEIGHT - 78, "Prepare a traceable distributor RFQ")
    draw_paragraph(
        pdf,
        "The following information helps the sales team review product selection, packaging and delivery options without guessing missing specifications.",
        MARGIN,
        PAGE_HEIGHT - 103,
        PAGE_WIDTH - MARGIN * 2,
        font_size=9.5,
        leading=14,
    )

    checklist = [
        "Product family, product name, SKU or current supplier reference",
        "Torch or machine model and compatible part reference, when available",
        "Size, thread, material or technical requirement supported by records",
        "Quantity required for each line and expected repeat order volume",
        "Current-part photos, drawings, labels or sample details",
        "Standard packing, logo, barcode, private label or carton requirements",
        "Destination country, requested delivery schedule and shipping preference",
    ]
    left_x = MARGIN
    left_width = 310
    y = PAGE_HEIGHT - 165
    for index, item in enumerate(checklist, 1):
        pdf.setFillColor(LIGHT_BLUE if index % 2 else PAPER)
        pdf.rect(left_x, y - 54, left_width, 50, stroke=0, fill=1)
        pdf.setFillColor(BLUE)
        pdf.circle(left_x + 20, y - 29, 11, stroke=0, fill=1)
        pdf.setFont("Helvetica-Bold", 8)
        pdf.setFillColor(white)
        pdf.drawCentredString(left_x + 20, y - 32, str(index))
        draw_paragraph(pdf, item, left_x + 40, y - 22, left_width - 52, font_size=8.7, leading=12)
        y -= 58

    panel_x = MARGIN + left_width + 18
    panel_width = PAGE_WIDTH - MARGIN - panel_x
    pdf.setFillColor(MIDNIGHT)
    pdf.rect(panel_x, PAGE_HEIGHT - 590, panel_width, 425, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.setFillColor(white)
    pdf.drawString(panel_x + 18, PAGE_HEIGHT - 195, "Start your inquiry")
    draw_paragraph(
        pdf,
        "Scan the code to open a distributor RFQ with source tracking, or contact the sales team directly.",
        panel_x + 18,
        PAGE_HEIGHT - 220,
        panel_width - 36,
        font_size=8.5,
        leading=13,
        color=HexColor("#DCE7F0"),
    )
    qr_size = 128
    qr_x = panel_x + (panel_width - qr_size) / 2
    qr_y = PAGE_HEIGHT - 405
    pdf.setFillColor(white)
    pdf.rect(qr_x - 8, qr_y - 8, qr_size + 16, qr_size + 16, stroke=0, fill=1)
    draw_qr(pdf, tracking_url, qr_x, qr_y, qr_size)
    pdf.setFont("Helvetica-Bold", 8.2)
    pdf.setFillColor(SIGNAL)
    pdf.drawCentredString(panel_x + panel_width / 2, PAGE_HEIGHT - 433, "REQUEST A QUOTE")

    contact_y = PAGE_HEIGHT - 476
    pdf.setFont("Helvetica-Bold", 8)
    pdf.setFillColor(HexColor("#9FB3C5"))
    pdf.drawString(panel_x + 18, contact_y, "EMAIL")
    pdf.setFont("Helvetica", 8.4)
    pdf.setFillColor(white)
    pdf.drawString(panel_x + 18, contact_y - 16, "arcfortweld@outlook.com")
    pdf.setFont("Helvetica-Bold", 8)
    pdf.setFillColor(HexColor("#9FB3C5"))
    pdf.drawString(panel_x + 18, contact_y - 44, "WHATSAPP")
    pdf.setFont("Helvetica", 8.4)
    pdf.setFillColor(white)
    pdf.drawString(panel_x + 18, contact_y - 60, "+86-18803076512")
    pdf.setFont("Helvetica-Bold", 8)
    pdf.setFillColor(HexColor("#9FB3C5"))
    pdf.drawString(panel_x + 18, contact_y - 88, "WEB")
    pdf.setFont("Helvetica", 8.4)
    pdf.setFillColor(white)
    pdf.drawString(panel_x + 18, contact_y - 104, "www.arcfortweld.com")

    pdf.setFillColor(PAPER)
    pdf.rect(MARGIN, 52, PAGE_WIDTH - MARGIN * 2, 96, stroke=0, fill=1)
    pdf.setFont("Helvetica-Bold", 10)
    pdf.setFillColor(MIDNIGHT)
    pdf.drawString(MARGIN + 14, 127, "Technical confirmation notice")
    draw_paragraph(
        pdf,
        "Compatibility, exact specifications, product-level MOQ and lead time are confirmed against the requested model, sample or drawing, quantity and packaging requirements. This guide is for sourcing preparation and does not replace a final quotation or technical approval.",
        MARGIN + 14,
        107,
        PAGE_WIDTH - MARGIN * 2 - 28,
        font_size=8.2,
        leading=12,
    )
    pdf.showPage()


def generate_pdf():
    for required_path in [CAMPAIGN_CSV, HERO_IMAGE, *[path for _, path in PRODUCT_IMAGES]]:
        if not required_path.exists():
            raise FileNotFoundError(f"Required promotion asset is missing: {required_path}")

    OUTPUT_PDF.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PDF.parent.mkdir(parents=True, exist_ok=True)
    hero_image = prepare_pdf_image(HERO_IMAGE, max_width=1200, quality=86)
    product_images = [
        (caption, prepare_pdf_image(path, max_width=520, quality=86))
        for caption, path in PRODUCT_IMAGES
    ]
    tracking_url = load_tracking_url("pdf_guide_qr")
    pdf = canvas.Canvas(str(OUTPUT_PDF), pagesize=A4, pageCompression=1)
    pdf.setTitle("ArcFort Weld Distributor Sourcing Guide")
    pdf.setAuthor("Renqiu Ailesen Welding Technology Co., Ltd.")
    pdf.setSubject("Welding and cutting product sourcing guide for distributors and importers")
    pdf.setKeywords("ArcFort Weld, welding torch parts, plasma cutting consumables, distributor RFQ")

    draw_cover(pdf, hero_image)
    draw_product_scope(pdf, product_images)
    draw_sourcing_process(pdf)
    draw_rfq_checklist(pdf, tracking_url)
    pdf.save()
    shutil.copyfile(OUTPUT_PDF, PUBLIC_PDF)
    print(f"Generated: {OUTPUT_PDF}")
    print(f"Published copy: {PUBLIC_PDF}")
    print(f"Tracked QR URL: {tracking_url}")


if __name__ == "__main__":
    generate_pdf()
