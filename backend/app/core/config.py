import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "generated_reports"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "KisanClaim"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "kisanclaim-secure-secret-key-2026-hackathon-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite:///{BASE_DIR / 'kisanclaim.db'}"
    )
    UPLOAD_PATH: str = str(UPLOAD_DIR)
    REPORT_PATH: str = str(REPORT_DIR)
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}

settings = Settings()
