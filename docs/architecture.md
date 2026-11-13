# KisanClaim — Architecture & Engineering Specification

## 1. High-Level Modular Monolith Architecture

KisanClaim is structured as a decoupled, multi-tier full-stack system designed for hackathon demonstration and cloud deployment:

```
+------------------------------------------------------------------------+
|                          Web Presentation Layer                        |
|   React 18 + TypeScript + Vite + Tailwind CSS + Leaflet (Interactive)  |
+-----------------------------------^------------------------------------+
                                    | REST APIs (JSON) + JWT
+-----------------------------------v------------------------------------+
|                         Application Service Tier                       |
|                             FastAPI (Async)                            |
|                                                                        |
|  +------------------+  +-------------------+  +---------------------+  |
|  |  DIGIPIN Engine  |  |  Sentinel-2 NDVI  |  | Open-Meteo Weather  |  |
|  |  (10-Level Grid) |  |  Remote Sensing   |  | Historical Reanal.  |  |
|  +------------------+  +-------------------+  +---------------------+  |
|                                                                        |
|  +------------------+  +-------------------+  +---------------------+  |
|  | EXIF Extraction  |  | Assessment Engine |  | ReportLab PDF Doss. |  |
|  | & Geo-distance   |  | Rule-based Model  |  | QR Code + SHA-256   |  |
|  +------------------+  +-------------------+  +---------------------+  |
+-----------------------------------^------------------------------------+
                                    | SQLAlchemy 2.0 ORM
+-----------------------------------v------------------------------------+
|                         Persistence Layer                              |
|           SQLite (Local Zero-Config) / PostgreSQL + PostGIS            |
+------------------------------------------------------------------------+
```

## 2. Key Modules
- **`app.digipin.digipin`**: Pure Python implementation of the India Post 10-level hierarchical subdivision, bounding box checks, boundary handling, and reversibility decoder.
- **`app.services.farm_service`**: Shapely polygon parsing, geodesic area computation in acres, centroid calculation, and DIGIPIN derivation.
- **`app.services.evidence_service`**: PIL/Pillow EXIF extraction (GPS latitude/longitude, timestamp, camera make/model), Haversine distance from photo GPS to registered field centroid, and SHA-256 file hashing.
- **`app.services.satellite_service`**: Sentinel-2 Level-2A multi-spectral surface reflectance processing (NIR Band 8, Red Band 4), computing NDVI before and after disaster events, cloud masking, and valid pixel percentages.
- **`app.services.weather_service`**: Historical daily rainfall and temperature observations via Open-Meteo with statistical climatological anomaly calculation.
- **`app.services.assessment_service`**: Transparent rule-based assessment assigning damage categories, confidence scores, and rule trigger logs.
- **`app.services.report_service`**: Multi-page PDF generation using ReportLab, embedding field particulars, DIGIPIN stamps, satellite charts, QR verification codes, and SHA-256 tamper-evident hashes.
