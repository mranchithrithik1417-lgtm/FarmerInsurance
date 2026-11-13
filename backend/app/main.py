from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, digipin, farms, fields, claims, evidence, reports, reviews, admin
from database.seeds.seed_data import seed_database

app = FastAPI(
    title="KisanClaim API",
    description="Agricultural Crop Damage Assessment, DIGIPIN Geographic Addressing, Satellite Analysis and Insurance Claim Support Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for development and production web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories for evidence uploads and generated PDF reports
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_PATH), name="uploads")
app.mount("/generated_reports", StaticFiles(directory=settings.REPORT_PATH), name="generated_reports")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(digipin.router, prefix=settings.API_V1_STR)
app.include_router(farms.router, prefix=settings.API_V1_STR)
app.include_router(fields.router, prefix=settings.API_V1_STR)
app.include_router(claims.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "KisanClaim API",
        "version": "1.0.0",
        "digipin_specification": "India Post 10-level hierarchical EPSG:4326",
        "remote_sensing": "Sentinel-2 MSI (Level-2A)",
        "weather_data": "Open-Meteo Historical Archive"
    }
