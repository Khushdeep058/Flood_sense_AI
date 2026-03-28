import requests
import random
import logging
import os
import glob

# Try to import rasterio if user has it installed
try:
    import rasterio
    from rasterio.warp import transform
    RASTERIO_AVAILABLE = True
except ImportError:
    RASTERIO_AVAILABLE = False

logger = logging.getLogger("FloodSense.Elevation")
SRTM_DIR = "data/srtm/"


def get_elevation_from_tif(lat, lon):
    """
    Reads the highest resolution elevation from a .tif file (if present).
    Automatically scans data/srtm/*.tif for coverage.
    """
    if not RASTERIO_AVAILABLE:
        return None

    # Scan for any .tif files in the srtm directory
    tif_files = glob.glob(os.path.join(SRTM_DIR, "*.tif"))
    if not tif_files:
        return None

    for tif_path in tif_files:
        try:
            with rasterio.open(tif_path) as src:

                
                xs, ys = transform("EPSG:4326", src.crs, [lon], [lat])

                # Sample raster
                vals = [val[0] for val in src.sample([(xs[0], ys[0])])]

                # ✅ Improved No-data handling
                if vals and vals[0] not in [-32768, -9999] and vals[0] is not None:
                    return float(vals[0])

        except Exception as e:
            logger.warning(f"Error reading TIFF {tif_path}: {e}")

    return None


def get_elevation(lat, lon):
    """
    Hybrid Elevation Engine:
    1. TIF (SRTM) - Real offline dataset if available.
    2. API - Online fallback for global coverage.
    3. Simulation - Scientific fallback for demo safety.
    """

    # 🌲 1. TRY SRTM .TIF (Offline)
    elev_from_tif = get_elevation_from_tif(lat, lon)
    if elev_from_tif is not None:
        return elev_from_tif

    # 🌩 2. TRY API (Online)
    url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
    try:
        response = requests.get(url, timeout=3, verify=False)
        if response.status_code == 200:
            return response.json()["results"][0]["elevation"]
    except Exception as e:
        logger.warning(f"Elevation API failure: {e}")

    # 🗺 3. GEOGRAPHIC SIMULATION (Delhi profile fallback)
    base_elevation = 212.0

    # Yamuna river dip (east Delhi lower)
    dist_to_river = abs(lon - 77.25)
    river_dip = max(0, 15 - (dist_to_river * 150))

    # Delhi ridge boost (west Delhi higher)
    dist_to_ridge = abs(lon - 77.12)
    ridge_boost = max(0, 25 - (dist_to_ridge * 200))

    # slight north-south slope
    lat_gradient = (lat - 28.6) * 10

    final_elev = base_elevation - river_dip + ridge_boost + lat_gradient

    return round(final_elev + random.uniform(-0.5, 0.5), 1)