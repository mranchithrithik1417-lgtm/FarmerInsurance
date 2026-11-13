# KisanClaim 🌾🛰️
### Agricultural Crop Damage Assessment, India Post DIGIPIN Referencing, Sentinel-2 Satellite Analysis & Insurance Claim Support Platform

[![Pytest Test Suite](https://img.shields.io/badge/pytest-14%20passed-brightgreen.svg)]()
[![Frontend Build](https://img.shields.io/badge/vite-passed-success.svg)]()
[![DIGIPIN Standard](https://img.shields.io/badge/India%20Post%20DIGIPIN-Verified%20(39J49LL8T4)-blue.svg)]()
[![Remote Sensing](https://img.shields.io/badge/Sentinel--2-NDVI%20Multi--spectral-forest.svg)]()

KisanClaim is a web-based agricultural crop damage assessment and insurance claim-support platform. It unites smallholder farmer ground evidence with official **India Post DIGIPIN** 10-level hierarchical addressing, **Copernicus Sentinel-2** satellite vegetation index analysis (NDVI), and **Open-Meteo** historical weather reanalysis.

---

## 🌟 Key Features

1. **Official India Post DIGIPIN Geographic Referencing**:
   - Strict 10-level hierarchical 4×4 spatial subdivision over EPSG:4326 bounding box `[2.5°N - 38.5°N, 63.5°E - 99.5°E]`.
   - Verified reference test: **Dak Bhawan, New Delhi** (`28.622788°N, 77.213033°E`) $\rightarrow$ **`39J49LL8T4`** (Display: `39J 49LL 8T4`).
   - Boundary-handling: Eastward on vertical lines, northward on horizontal lines, top-most southward, right-most westward.
   - Interactive 10-level visual grid explorer with step-by-step animation and reverse decoder.

2. **Interactive Farm & Field Polygon Mapping**:
   - Interactive Leaflet map enabling farmers to draw field boundaries.
   - Automatic geodesic acreage calculation and centroid coordinate derivation.
   - Real-time generation of official DIGIPIN for the parcel centroid.

3. **Ground Evidence & EXIF Processing**:
   - Photograph upload with automated EXIF extraction (GPS latitude/longitude, capture timestamp, camera model).
   - Haversine distance computation checking proximity between photo capture location and registered field centroid.
   - Cryptographic SHA-256 integrity hash generation.

4. **Sentinel-2 Multi-Spectral Remote Sensing (NDVI)**:
   - Evaluates pre- and post-disaster vegetation indices using Band 8 (NIR, 842nm) and Band 4 (Red, 665nm):
     $$NDVI = \frac{NIR - RED}{NIR + RED}$$
   - Calculates vegetation canopy deficit percentage, cloud cover, and valid pixel coverage.

5. **Historical Weather Corroboration**:
   - Open-Meteo Historical Weather API integration fetching cumulative precipitation, peak 24-hour rainfall, and temperature ranges during the disaster window.
   - Quantifies precipitation anomaly percentage compared to 10-year climatological normals.

6. **Automated ReportLab PDF Dossier Generation**:
   - Generates official multi-page PDF reports with KisanClaim branding, field geometry, DIGIPIN stamps, satellite/weather charts, embedded verification QR codes, and SHA-256 tamper-evident integrity hashes.

7. **Role-Based Workflows**:
   - **Farmer Portal**: Farm & field registration, polygon drawing, claim submission wizard, evidence upload, dossier download.
   - **Officer Portal**: Assigned claims queue, deep-dive multi-source evidence audit, review notes, decision recording (Approve, Reject, Request Evidence).
   - **Admin Portal**: System telemetry, monitored acreage, user account management, and immutable audit logs.
   - **Multilingual Support**: English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) & npm
- Python (3.9+)
- Git

### 1. Run with One-Click Script
```bash
cd /Users/apple/Desktop/tech/KisanClaim
./scripts/run_local.sh
```
This automatically starts:
- **FastAPI Backend**: `http://127.0.0.1:8000` (Swagger docs at `/docs`)
- **React Frontend**: `http://localhost:5173`

---

### 2. Manual Startup

#### Backend
```bash
cd /Users/apple/Desktop/tech/KisanClaim
PYTHONPATH=backend ./venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend
```bash
cd /Users/apple/Desktop/tech/KisanClaim/frontend
npm run dev
```

---

### 3. Run Automated Tests
```bash
cd /Users/apple/Desktop/tech/KisanClaim
PYTHONPATH=backend ./venv/bin/pytest backend/tests/
```
Output:
```
backend/tests/test_api.py ....... [ 50%]
backend/tests/test_digipin.py ....... [100%]
======================== 14 passed in 5.82s ========================
```

---

## 👥 Demo Evaluation Accounts

| Role | Email Address | Password | Jurisdiction / Details |
| :--- | :--- | :--- | :--- |
| **Farmer** | `farmer.ramesh@kisanclaim.gov.in` | `Farmer@12345` | Ramesh Kumar, Mandya, Karnataka |
| **Agricultural Officer** | `officer.mandya@kisanclaim.gov.in` | `Officer@12345` | Anand Gowda, KAS, Dept of Agriculture |
| **Administrator** | `admin@kisanclaim.gov.in` | `Admin@12345` | Dr. Sunita Sharma, Platform Admin |

*Note: The login interface also features convenient 1-click evaluation preset buttons.*

---

## 🐳 Docker Deployment

To launch the full containerized stack with PostgreSQL, PostGIS, FastAPI, and Nginx:
```bash
docker-compose up --build -d
```

---

## ⚖️ Statutory Notice
KisanClaim is an evidence-support and preliminary assessment platform. It does not guarantee compensation, substitute official field visits, or automatically approve insurance claims under government or private schemes.
