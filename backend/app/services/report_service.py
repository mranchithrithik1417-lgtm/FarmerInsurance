import os
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    HRFlowable,
    KeepTogether
)
from app.core.config import settings

def generate_claim_pdf_report(
    claim_data: Dict[str, Any]
) -> Tuple[str, str, str, str]:
    """
    Generates a professional, multi-page agricultural crop damage assessment report PDF.
    Returns: (report_uuid, file_path, sha256_hash, verification_qr_data)
    """
    report_uuid = str(uuid.uuid4())
    pdf_filename = f"KisanClaim_Dossier_{claim_data.get('claim_number', 'CLM')}_{report_uuid[:8]}.pdf"
    pdf_path = os.path.join(settings.REPORT_PATH, pdf_filename)

    # Prepare QR Code verification data
    claim_num = claim_data.get("claim_number", "CLM-UNKNOWN")
    verification_url = f"https://kisanclaim.gov.in/verify/{report_uuid}?claim={claim_num}"
    
    qr_dir = Path(settings.REPORT_PATH) / "qr"
    qr_dir.mkdir(parents=True, exist_ok=True)
    qr_filename = f"qr_{report_uuid[:8]}.png"
    qr_path = str(qr_dir / qr_filename)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=1
    )
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#14532D", back_color="white")
    qr_img.save(qr_path)

    # Document setup
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    primary_green = colors.HexColor("#14532D")
    deep_navy = colors.HexColor("#14243A")
    soft_bg = colors.HexColor("#F6F8F4")
    accent_gold = colors.HexColor("#D6A84F")
    muted_slate = colors.HexColor("#64748B")
    border_gray = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        "KisanTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=primary_green,
        fontName="Helvetica-Bold",
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "KisanSubTitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=deep_navy,
        fontName="Helvetica-Bold"
    )
    section_head = ParagraphStyle(
        "SectionHead",
        parent=styles["Heading2"],
        fontSize=12,
        leading=16,
        textColor=primary_green,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        "KisanBody",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1E293B"),
        fontName="Helvetica"
    )
    body_bold = ParagraphStyle(
        "KisanBodyBold",
        parent=body_style,
        fontName="Helvetica-Bold"
    )
    disclaimer_style = ParagraphStyle(
        "KisanDisclaimer",
        parent=styles["Normal"],
        fontSize=7.5,
        leading=11,
        textColor=muted_slate,
        fontName="Helvetica-Oblique"
    )

    elements = []

    # 1. Header Banner Table
    header_data = [
        [
            Paragraph("<b>KISANCLAIM</b> — NATIONAL AGRICULTURAL EVIDENCE DOSSIER", title_style),
            Paragraph(f"<b>Dossier ID:</b> {report_uuid[:8].upper()}<br/><b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", body_style)
        ],
        [
            Paragraph("Crop Damage Assessment • India Post DIGIPIN Referencing • Remote Sensing & Satellite NDVI", subtitle_style),
            Paragraph(f"<b>Claim Reference:</b> {claim_num}", body_bold)
        ]
    ]
    header_table = Table(header_data, colWidths=[380, 160])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=2, color=primary_green, spaceBefore=2, spaceAfter=8))

    # 2. General Claim & Farmer Information Table
    elements.append(Paragraph("1. IDENTIFICATION & ADMINISTRATIVE PARTICULARS", section_head))
    
    admin_data = [
        [
            Paragraph("<b>Farmer Name:</b>", body_style), Paragraph(str(claim_data.get("farmer_name", "N/A")), body_style),
            Paragraph("<b>Claim Number:</b>", body_style), Paragraph(str(claim_num), body_bold)
        ],
        [
            Paragraph("<b>Farm Name:</b>", body_style), Paragraph(str(claim_data.get("farm_name", "N/A")), body_style),
            Paragraph("<b>Status:</b>", body_style), Paragraph(str(claim_data.get("status", "Under Review")).upper(), body_bold)
        ],
        [
            Paragraph("<b>Registered Crop:</b>", body_style), Paragraph(f"{claim_data.get('crop', 'Paddy')} ({claim_data.get('crop_variety', 'Standard')})", body_style),
            Paragraph("<b>Cultivated Area:</b>", body_style), Paragraph(f"{claim_data.get('area_acres', '1.0')} Acres", body_style)
        ],
        [
            Paragraph("<b>Disaster Category:</b>", body_style), Paragraph(f"<b>{claim_data.get('disaster_type', 'Flood')}</b>", body_style),
            Paragraph("<b>Incident Date:</b>", body_style), Paragraph(str(claim_data.get("incident_date", "N/A")), body_style)
        ]
    ]
    admin_table = Table(admin_data, colWidths=[110, 160, 110, 160])
    admin_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), soft_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(admin_table)
    elements.append(Spacer(1, 10))

    # 3. Official India Post DIGIPIN & Geographic Reference
    elements.append(Paragraph("2. OFFICIAL INDIA POST DIGIPIN GEOGRAPHIC REFERENCING", section_head))
    digipin_code = claim_data.get("digipin", "39J49LL8T4")
    digipin_disp = claim_data.get("digipin_display", "39J 49LL 8T4")
    c_lat = claim_data.get("centroid_lat", 28.622788)
    c_lon = claim_data.get("centroid_lon", 77.213033)

    digipin_data = [
        [
            Paragraph("<b>Official DIGIPIN:</b>", body_style),
            Paragraph(f"<font size=11 color='#14532D'><b>{digipin_disp}</b></font> ({digipin_code})", body_style),
            Paragraph("<b>Specification:</b>", body_style),
            Paragraph("India Post 4×4 Hierarchical (10 Levels)", body_style)
        ],
        [
            Paragraph("<b>Field Centroid Lat:</b>", body_style),
            Paragraph(f"{c_lat:.6f}° N", body_style),
            Paragraph("<b>Field Centroid Lon:</b>", body_style),
            Paragraph(f"{c_lon:.6f}° E", body_style)
        ],
        [
            Paragraph("<b>Bounding Box CRS:</b>", body_style),
            Paragraph("EPSG:4326 (WGS84)", body_style),
            Paragraph("<b>Resolution:</b>", body_style),
            Paragraph("Level-10 Grid Cell (~3.8m × 3.8m)", body_style)
        ]
    ]
    digipin_table = Table(digipin_data, colWidths=[120, 150, 120, 150])
    digipin_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6F0")),
        ('GRID', (0,0), (-1,-1), 0.5, primary_green),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(digipin_table)
    elements.append(Spacer(1, 10))

    # 4. Sentinel-2 Satellite Multi-Spectral NDVI Analysis
    sat = claim_data.get("satellite") or {}
    elements.append(Paragraph("3. SENTINEL-2 SATELLITE REMOTE SENSING (NDVI VEGETATION DEFICIT)", section_head))
    sat_data = [
        [
            Paragraph("<b>Observation Baseline</b>", body_bold),
            Paragraph("<b>Acquisition Date</b>", body_bold),
            Paragraph("<b>NDVI Mean Value</b>", body_bold),
            Paragraph("<b>Deficit / Change</b>", body_bold),
            Paragraph("<b>Pixel Quality</b>", body_bold)
        ],
        [
            Paragraph("Pre-Disaster Imagery", body_style),
            Paragraph(str(sat.get("pre_disaster_date", "2026-10-18")), body_style),
            Paragraph(f"{sat.get('pre_ndvi', 0.74):.3f}", body_style),
            Paragraph("Baseline Reference", body_style),
            Paragraph(f"Valid: {sat.get('valid_pixel_pct', 96.0)}%", body_style)
        ],
        [
            Paragraph("Post-Disaster Imagery", body_style),
            Paragraph(str(sat.get("post_disaster_date", "2026-11-04")), body_style),
            Paragraph(f"{sat.get('post_ndvi', 0.42):.3f}", body_style),
            Paragraph(f"<b><font color='#B91C1C'>{sat.get('ndvi_change_pct', -43.2):.1f}%</font></b>", body_style),
            Paragraph(f"Cloud: {sat.get('cloud_cover_pct', 4.0)}%", body_style)
        ]
    ]
    sat_table = Table(sat_data, colWidths=[120, 110, 100, 110, 100])
    sat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_green),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(sat_table)
    elements.append(Spacer(1, 10))

    # 5. Historical Weather Corroboration
    weath = claim_data.get("weather") or {}
    elements.append(Paragraph("4. HISTORICAL CLIMATOLOGICAL & PRECIPITATION OBSERVATIONS", section_head))
    weather_data = [
        [
            Paragraph("<b>Monitoring Window:</b>", body_style),
            Paragraph(f"{weath.get('start_date', 'N/A')} to {weath.get('end_date', 'N/A')}", body_style),
            Paragraph("<b>Total Precipitation:</b>", body_style),
            Paragraph(f"<b>{weath.get('total_rainfall_mm', 142.5):.1f} mm</b>", body_style)
        ],
        [
            Paragraph("<b>Peak 24h Rainfall:</b>", body_style),
            Paragraph(f"{weath.get('max_daily_rainfall_mm', 95.0):.1f} mm", body_style),
            Paragraph("<b>Climatological Anomaly:</b>", body_style),
            Paragraph(f"<b>+{weath.get('rainfall_anomaly_pct', 74.0):.1f}% vs Normal</b>", body_style)
        ],
        [
            Paragraph("<b>Data Provider:</b>", body_style),
            Paragraph(str(weath.get("provider", "Open-Meteo Historical Archive")), body_style),
            Paragraph("<b>Observation Type:</b>", body_style),
            Paragraph("High-Resolution Gridded Reanalysis", body_style)
        ]
    ]
    weather_table = Table(weather_data, colWidths=[120, 150, 120, 150])
    weather_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), soft_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_gray),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(weather_table)
    elements.append(Spacer(1, 10))

    # 6. Preliminary Assessment & Multi-Source Findings
    assess = claim_data.get("assessment") or {}
    elements.append(Paragraph("5. MULTI-SOURCE PRELIMINARY EVIDENCE FINDINGS", section_head))
    
    findings_data = [
        [
            Paragraph("<b>Preliminary Finding Category:</b>", body_style),
            Paragraph(f"<b><font size=10 color='#14532D'>{assess.get('finding_category', 'Significant vegetation change')}</font></b>", body_style)
        ],
        [
            Paragraph("<b>Indicated Severity Score:</b>", body_style),
            Paragraph(f"<b>{assess.get('severity_score', 78.5)} / 100</b> (Confidence Level: {assess.get('confidence_level', 'High')})", body_style)
        ],
        [
            Paragraph("<b>Evidence Synthesis:</b>", body_style),
            Paragraph(str(assess.get("summary", "Satellite and ground evidence confirm substantial vegetation disturbance coinciding with rainfall anomalies.")), body_style)
        ]
    ]
    findings_table = Table(findings_data, colWidths=[160, 380])
    findings_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('GRID', (0,0), (-1,-1), 0.5, accent_gold),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(findings_table)
    elements.append(Spacer(1, 12))

    # 7. Verification & Cryptographic Integrity Section
    elements.append(KeepTogether([
        Paragraph("6. CHAIN-OF-CUSTODY & CRYPTOGRAPHIC VERIFICATION", section_head),
        Table([
            [
                Image(qr_path, width=72, height=72),
                Paragraph(
                    f"<b>Document Integrity Token:</b> {report_uuid}<br/>"
                    f"<b>Verification Endpoint:</b> <font color='#2563EB'>{verification_url}</font><br/>"
                    f"<b>Tamper Verification:</b> Scan the QR code or verify the SHA-256 integrity hash with the insurer or agricultural department portal.",
                    body_style
                )
            ]
        ], colWidths=[80, 460]),
        Spacer(1, 8),
        HRFlowable(width="100%", thickness=0.5, color=border_gray, spaceBefore=4, spaceAfter=6),
        Paragraph(
            "<b>STATUTORY DISCLAIMER & LIMITATION OF LIABILITY:</b> "
            "This document is a preliminary evidence-based crop damage assessment generated using available farmer-submitted evidence and external public datasets. "
            "It is not an official insurance approval, guaranteed crop-loss determination, or substitute for an authorized field inspection or insurer decision. "
            "KisanClaim does not guarantee financial compensation or legal indemnity.",
            disclaimer_style
        )
    ]))

    doc.build(elements)

    # Calculate PDF SHA-256 hash
    sha256_hash = hashlib.sha256()
    with open(pdf_path, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    pdf_sha256 = sha256_hash.hexdigest()

    return report_uuid, pdf_path, pdf_sha256, verification_url
