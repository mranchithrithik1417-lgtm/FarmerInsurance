"""
Official India Post DIGIPIN Implementation
Specification Reference: India Post Technical Document (IIT Hyderabad & NRSC/ISRO)
Alphabet: 16 characters (2, 3, 4, 5, 6, 7, 8, 9, C, J, K, L, M, P, F, T)
Bounding Box: EPSG:4326, Lat: [2.5, 38.5], Lon: [63.5, 99.5]
Hierarchical subdivision: 4x4 grid across 10 levels.
"""

from typing import Dict, Any, List, Tuple

# Official Bounding Box
BOUNDS = {
    "min_lat": 2.5,
    "max_lat": 38.5,
    "min_lon": 63.5,
    "max_lon": 99.5
}

# Official 4x4 character matrix: Rows North to South, Columns West to East
DIGIPIN_MATRIX: List[List[str]] = [
    ['F', 'C', '9', '8'],
    ['J', '3', '2', '7'],
    ['K', '4', '5', '6'],
    ['L', 'M', 'P', 'T']
]

# Permitted character set
PERMITTED_CHARS = set("23456789CJKLMPFT")

# Reverse lookup dictionary
CHAR_TO_POS: Dict[str, Tuple[int, int]] = {}
for r in range(4):
    for c in range(4):
        CHAR_TO_POS[DIGIPIN_MATRIX[r][c]] = (r, c)


def format_digipin_display(code: str) -> str:
    """Format 10-character DIGIPIN into standard 3-4-3 display (e.g. 39J 49LL L8T4)."""
    clean = code.replace(" ", "").replace("-", "").upper()
    if len(clean) == 10:
        return f"{clean[:3]} {clean[3:7]} {clean[7:]}"
    return code


def encode_digipin(lat: float, lon: float) -> str:
    """
    Encode latitude and longitude into an official 10-character DIGIPIN code.
    Enforces official India Post bounding box and boundary handling.
    """
    if not (BOUNDS["min_lat"] <= lat <= BOUNDS["max_lat"]):
        raise ValueError(f"Latitude {lat}° is outside official DIGIPIN bounding box [{BOUNDS['min_lat']}, {BOUNDS['max_lat']}]")
    if not (BOUNDS["min_lon"] <= lon <= BOUNDS["max_lon"]):
        raise ValueError(f"Longitude {lon}° is outside official DIGIPIN bounding box [{BOUNDS['min_lon']}, {BOUNDS['max_lon']}]")

    min_lat, max_lat = BOUNDS["min_lat"], BOUNDS["max_lat"]
    min_lon, max_lon = BOUNDS["min_lon"], BOUNDS["max_lon"]
    code_chars: List[str] = []

    for _ in range(10):
        lat_step = (max_lat - min_lat) / 4.0
        lon_step = (max_lon - min_lon) / 4.0

        # Row determination (North to South: Row 0 is North-most, Row 3 is South-most)
        # Boundary rule: on horizontal line, choose northward cell (smaller row index)
        # Top-most boundary: southward cell (row 0)
        row_val = (max_lat - lat) / lat_step
        if abs(lat - max_lat) < 1e-12:
            row = 0
        elif abs(lat - min_lat) < 1e-12:
            row = 3
        else:
            if abs(row_val - round(row_val)) < 1e-10 and round(row_val) in (1, 2, 3):
                row = int(round(row_val)) - 1
            else:
                row = int(row_val)
        row = max(0, min(3, row))

        # Col determination (West to East: Col 0 is West-most, Col 3 is East-most)
        # Boundary rule: on vertical line, choose eastward cell (larger col index)
        # Right-most boundary: westward cell (col 3)
        col_val = (lon - min_lon) / lon_step
        if abs(lon - max_lon) < 1e-12:
            col = 3
        elif abs(lon - min_lon) < 1e-12:
            col = 0
        else:
            col = int(col_val)
        col = max(0, min(3, col))

        code_chars.append(DIGIPIN_MATRIX[row][col])

        # Subdivide bounding box for next level
        sub_max_lat = max_lat - row * lat_step
        sub_min_lat = sub_max_lat - lat_step
        sub_min_lon = min_lon + col * lon_step
        sub_max_lon = sub_min_lon + lon_step

        min_lat, max_lat = sub_min_lat, sub_max_lat
        min_lon, max_lon = sub_min_lon, sub_max_lon

    return "".join(code_chars)


def decode_digipin(code: str) -> Dict[str, Any]:
    """
    Decode an official 10-character DIGIPIN code into center coordinate,
    cell bounds, and cell dimensions.
    """
    clean = code.replace(" ", "").replace("-", "").upper()
    if len(clean) != 10:
        raise ValueError(f"DIGIPIN must contain exactly 10 characters, received {len(clean)}")

    for ch in clean:
        if ch not in CHAR_TO_POS:
            raise ValueError(f"Character '{ch}' is not in the official DIGIPIN alphabet")

    min_lat, max_lat = BOUNDS["min_lat"], BOUNDS["max_lat"]
    min_lon, max_lon = BOUNDS["min_lon"], BOUNDS["max_lon"]

    for ch in clean:
        row, col = CHAR_TO_POS[ch]
        lat_step = (max_lat - min_lat) / 4.0
        lon_step = (max_lon - min_lon) / 4.0

        sub_max_lat = max_lat - row * lat_step
        sub_min_lat = sub_max_lat - lat_step
        sub_min_lon = min_lon + col * lon_step
        sub_max_lon = sub_min_lon + lon_step

        min_lat, max_lat = sub_min_lat, sub_max_lat
        min_lon, max_lon = sub_min_lon, sub_max_lon

    center_lat = (min_lat + max_lat) / 2.0
    center_lon = (min_lon + max_lon) / 2.0
    lat_deg = max_lat - min_lat
    lon_deg = max_lon - min_lon

    # Approximate physical meters (1 deg lat ~ 111,000m, 1 deg lon ~ 111,000m * cos(center_lat))
    import math
    lat_m = lat_deg * 111320.0
    lon_m = lon_deg * 111320.0 * math.cos(math.radians(center_lat))

    return {
        "valid": True,
        "digipin": clean,
        "display_format": format_digipin_display(clean),
        "center_lat": round(center_lat, 7),
        "center_lon": round(center_lon, 7),
        "min_lat": round(min_lat, 7),
        "max_lat": round(max_lat, 7),
        "min_lon": round(min_lon, 7),
        "max_lon": round(max_lon, 7),
        "cell_size_lat_deg": lat_deg,
        "cell_size_lon_deg": lon_deg,
        "cell_height_m_approx": round(lat_m, 2),
        "cell_width_m_approx": round(lon_m, 2)
    }


def get_digipin_hierarchy(lat: float, lon: float) -> Dict[str, Any]:
    """
    Generate the step-by-step 10-level hierarchical 4x4 subdivision breakdown
    for educational and interactive explorer visualization.
    """
    if not (BOUNDS["min_lat"] <= lat <= BOUNDS["max_lat"] and BOUNDS["min_lon"] <= lon <= BOUNDS["max_lon"]):
        raise ValueError(f"Coordinates ({lat}, {lon}) are outside India Post DIGIPIN bounds")

    levels: List[Dict[str, Any]] = []
    min_lat, max_lat = BOUNDS["min_lat"], BOUNDS["max_lat"]
    min_lon, max_lon = BOUNDS["min_lon"], BOUNDS["max_lon"]
    accumulated_prefix = ""

    level_names = [
        "National Sub-continent Level (9° × 9°)",
        "Regional Zone Level (2.25° × 2.25°)",
        "Sub-regional Level (0.5625° × 0.5625°)",
        "District Cluster Level (~15.6 km)",
        "Taluk / Tehsil Level (~3.9 km)",
        "Village / Locality Level (~975 m)",
        "Sub-locality / Ward Level (~244 m)",
        "Neighborhood / Block Level (~61 m)",
        "Parcel / Property Level (~15.2 m)",
        "Target Cell Level (~3.8 m × 3.8 m)"
    ]

    for lvl in range(10):
        lat_step = (max_lat - min_lat) / 4.0
        lon_step = (max_lon - min_lon) / 4.0

        # Row determination
        row_val = (max_lat - lat) / lat_step
        if abs(lat - max_lat) < 1e-12:
            row = 0
        elif abs(lat - min_lat) < 1e-12:
            row = 3
        else:
            if abs(row_val - round(row_val)) < 1e-10 and round(row_val) in (1, 2, 3):
                row = int(round(row_val)) - 1
            else:
                row = int(row_val)
        row = max(0, min(3, row))

        # Col determination
        col_val = (lon - min_lon) / lon_step
        if abs(lon - max_lon) < 1e-12:
            col = 3
        elif abs(lon - min_lon) < 1e-12:
            col = 0
        else:
            col = int(col_val)
        col = max(0, min(3, col))

        char = DIGIPIN_MATRIX[row][col]
        accumulated_prefix += char

        # Build 4x4 grid metadata for the current level
        grid_cells: List[List[Dict[str, Any]]] = []
        for r in range(4):
            grid_row: List[Dict[str, Any]] = []
            c_max_lat = max_lat - r * lat_step
            c_min_lat = c_max_lat - lat_step
            for c in range(4):
                c_min_lon = min_lon + c * lon_step
                c_max_lon = c_min_lon + lon_step
                c_char = DIGIPIN_MATRIX[r][c]
                is_selected = (r == row and c == col)
                grid_row.append({
                    "char": c_char,
                    "row": r,
                    "col": c,
                    "is_selected": is_selected,
                    "bounds": {
                        "min_lat": round(c_min_lat, 7),
                        "max_lat": round(c_max_lat, 7),
                        "min_lon": round(c_min_lon, 7),
                        "max_lon": round(c_max_lon, 7)
                    }
                })
            grid_cells.append(grid_row)

        sub_max_lat = max_lat - row * lat_step
        sub_min_lat = sub_max_lat - lat_step
        sub_min_lon = min_lon + col * lon_step
        sub_max_lon = sub_min_lon + lon_step

        explanation = (
            f"Level {lvl + 1}: The region is partitioned into a 4×4 grid. "
            f"Coordinates ({lat:.5f}, {lon:.5f}) fall in quadrant [{row},{col}], "
            f"assigned official symbol '{char}'. Cumulative: {accumulated_prefix}."
        )

        levels.append({
            "level": lvl + 1,
            "title": level_names[lvl],
            "char": char,
            "row": row,
            "col": col,
            "accumulated_prefix": accumulated_prefix,
            "grid_cells": grid_cells,
            "current_bounds": {
                "min_lat": round(min_lat, 7),
                "max_lat": round(max_lat, 7),
                "min_lon": round(min_lon, 7),
                "max_lon": round(max_lon, 7)
            },
            "selected_bounds": {
                "min_lat": round(sub_min_lat, 7),
                "max_lat": round(sub_max_lat, 7),
                "min_lon": round(sub_min_lon, 7),
                "max_lon": round(sub_max_lon, 7)
            },
            "lat_step_deg": lat_step,
            "lon_step_deg": lon_step,
            "explanation": explanation
        })

        min_lat, max_lat = sub_min_lat, sub_max_lat
        min_lon, max_lon = sub_min_lon, sub_max_lon

    final_digipin = accumulated_prefix
    return {
        "digipin": final_digipin,
        "display_format": format_digipin_display(final_digipin),
        "target_lat": lat,
        "target_lon": lon,
        "levels": levels
    }
