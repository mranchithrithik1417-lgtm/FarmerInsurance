import os
import hashlib
import math
from typing import Dict, Any, Optional, Tuple
from PIL import Image, ExifTags
from pathlib import Path

def get_file_sha256(filepath: str) -> str:
    """Computes SHA-256 integrity hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def _convert_to_degrees(value) -> Optional[float]:
    """Helper function to convert the GPS coordinates stored in the EXIF to degrees in float format"""
    try:
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)
    except Exception:
        return None

def extract_exif_metadata(filepath: str) -> Dict[str, Any]:
    """
    Extracts EXIF GPS coordinates, timestamp, and camera metadata from image.
    Preserves raw data and never flags missing EXIF as fraud.
    """
    metadata: Dict[str, Any] = {
        "lat": None,
        "lon": None,
        "timestamp": None,
        "camera": None,
        "has_gps": False
    }

    try:
        with Image.open(filepath) as img:
            exif_raw = img._getexif()
            if not exif_raw:
                return metadata

            exif = {}
            for tag, value in exif_raw.items():
                decoded = ExifTags.TAGS.get(tag, tag)
                exif[decoded] = value

            # Extract Timestamp
            metadata["timestamp"] = exif.get("DateTimeOriginal") or exif.get("DateTime")

            # Extract Camera Model
            make = exif.get("Make", "").strip()
            model = exif.get("Model", "").strip()
            if make or model:
                metadata["camera"] = f"{make} {model}".strip()

            # Extract GPS
            gps_info = exif.get("GPSInfo")
            if gps_info:
                gps_data = {}
                for t in gps_info:
                    sub_decoded = ExifTags.GPSTAGS.get(t, t)
                    gps_data[sub_decoded] = gps_info[t]

                gps_latitude = gps_data.get("GPSLatitude")
                gps_latitude_ref = gps_data.get("GPSLatitudeRef")
                gps_longitude = gps_data.get("GPSLongitude")
                gps_longitude_ref = gps_data.get("GPSLongitudeRef")

                if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
                    lat = _convert_to_degrees(gps_latitude)
                    lon = _convert_to_degrees(gps_longitude)

                    if lat is not None and lon is not None:
                        if gps_latitude_ref != "N":
                            lat = -lat
                        if gps_longitude_ref != "E":
                            lon = -lon

                        metadata["lat"] = round(lat, 7)
                        metadata["lon"] = round(lon, 7)
                        metadata["has_gps"] = True
    except Exception:
        # Gracefully handle non-EXIF or corrupted files
        pass

    return metadata

def calculate_haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)
