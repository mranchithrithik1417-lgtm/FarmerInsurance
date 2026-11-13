# KisanClaim — REST API Documentation

Base URL: `/api`

Interactive Swagger UI: `http://127.0.0.1:8000/docs`
Interactive ReDoc: `http://127.0.0.1:8000/redoc`

---

## 1. Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new farmer or officer account.
- `POST /api/auth/login`: Authenticate and receive JWT access token.
- `GET /api/auth/me`: Retrieve current user profile and role details.

---

## 2. DIGIPIN Geographic Addressing (`/api/digipin`)
- `POST /api/digipin/encode`:
  - Request: `{"latitude": 28.622788, "longitude": 77.213033}`
  - Response: `{"digipin": "39J49LL8T4", "display_format": "39J 49LL 8T4", "latitude": 28.622788, "longitude": 77.213033}`
- `POST /api/digipin/decode`:
  - Request: `{"digipin": "39J49LL8T4"}`
  - Response: Cell center coordinates, bounding box limits, and physical cell width/height in meters (~3.8m).
- `GET /api/digipin/hierarchy?lat=28.622788&lon=77.213033`:
  - Returns complete 10-level hierarchical subdivision breakdown with 4×4 grid cells, active symbols, angular steps, and educational explanations for interactive visual explorers.

---

## 3. Farms & Fields (`/api/farms`, `/api/fields`)
- `GET /api/farms`: List all registered farms for user.
- `POST /api/farms`: Create a farm.
- `GET /api/fields`: List agricultural field parcels with DIGIPIN reference.
- `POST /api/fields`: Submit GeoJSON polygon. Automatically computes area in acres, centroid coordinate, and official DIGIPIN reference.

---

## 4. Claims & Evidence (`/api/claims`)
- `GET /api/claims`: List submitted claims (filtered by status).
- `POST /api/claims`: Create crop damage claim. Automatically triggers Sentinel-2 NDVI analysis, Open-Meteo weather analysis, and preliminary assessment evaluation.
- `GET /api/claims/{id}`: Detailed claim dossier including evidence, satellite metrics, weather observations, and officer reviews.
- `POST /api/claims/{id}/evidence`: Upload damage photograph (multipart/form-data). Extracts EXIF GPS, timestamp, camera make, and calculates Haversine distance to field centroid.

---

## 5. Assessment & Reports (`/api/reports`)
- `POST /api/claims/{id}/generate-report`: Generates official multi-page PDF dossier with ReportLab, QR verification code, and SHA-256 integrity hash.
- `GET /api/reports/{uuid}/download`: Download generated PDF report.

---

## 6. Officer Reviews & Administration (`/api/claims/{id}/review`, `/api/admin`)
- `POST /api/claims/{id}/review`: Record officer decision (`approved`, `rejected`, `additional_evidence_required`), remarks, or evidence requests.
- `GET /api/admin/stats`: System-wide telemetry (monitored acres, claim distribution, integration health).
- `GET /api/admin/users`: List platform accounts.
- `GET /api/admin/audit-logs`: Immutable audit trail.
