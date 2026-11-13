import json
import math
from typing import Tuple, Dict, Any
from shapely.geometry import shape, Polygon, Point
from app.digipin.digipin import encode_digipin, format_digipin_display

def parse_geometry_and_calculate_centroid(geojson_input: str) -> Tuple[float, float, float, str]:
    """
    Parses GeoJSON string or coordinate array, returns:
    (centroid_lat, centroid_lon, area_acres, normalized_geojson_str)
    """
    try:
        data = json.loads(geojson_input)
    except Exception:
        raise ValueError("Invalid GeoJSON string format")

    geom = None
    if isinstance(data, dict):
        if data.get("type") == "Feature":
            geom = shape(data["geometry"])
        elif "coordinates" in data:
            geom = shape(data)
        elif data.get("type") == "FeatureCollection" and data.get("features"):
            geom = shape(data["features"][0]["geometry"])
    elif isinstance(data, list):
        # List of [lat, lon] or [lon, lat]
        coords = []
        for pt in data:
            if isinstance(pt, (list, tuple)) and len(pt) >= 2:
                # Leaflet uses [lat, lon], GeoJSON expects [lon, lat]
                coords.append((pt[1], pt[0]))
        if coords:
            if coords[0] != coords[-1]:
                coords.append(coords[0])
            geom = Polygon(coords)

    if geom is None or not geom.is_valid:
        raise ValueError("Invalid field polygon geometry")

    centroid = geom.centroid
    centroid_lon = float(centroid.x)
    centroid_lat = float(centroid.y)

    # Approximate area in acres:
    # 1 degree lat ~ 111,000m, 1 degree lon ~ 111,000m * cos(lat)
    # Area in sq meters -> 1 acre = 4046.86 sq meters
    bounds = geom.bounds
    cos_lat = math.cos(math.radians(centroid_lat))
    # Transform coordinates to approximate meters for area calculation
    meter_coords = [
        (x * 111320.0 * cos_lat, y * 111320.0)
        for x, y in geom.exterior.coords
    ]
    meter_poly = Polygon(meter_coords)
    area_sq_m = abs(meter_poly.area)
    area_acres = round(area_sq_m / 4046.86, 2)
    if area_acres <= 0.0:
        area_acres = 0.5  # fallback minimum

    normalized_geojson = json.dumps({
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [list(geom.exterior.coords)]
        },
        "properties": {
            "centroid": [centroid_lat, centroid_lon],
            "area_acres": area_acres
        }
    })

    return centroid_lat, centroid_lon, area_acres, normalized_geojson


def generate_field_digipin(centroid_lat: float, centroid_lon: float) -> Tuple[str, str]:
    """Generates official 10-character DIGIPIN and display format for field centroid."""
    code = encode_digipin(centroid_lat, centroid_lon)
    display = format_digipin_display(code)
    return code, display
