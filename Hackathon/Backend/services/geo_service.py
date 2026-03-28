import geopandas as gpd
import osmnx as ox
import os
import pickle
from shapely.geometry import Polygon, MultiPolygon, GeometryCollection
from shapely.ops import unary_union
from concurrent.futures import ThreadPoolExecutor
from services.rainfall_service import get_rainfall_24h
from services.elevation_service import get_elevation

PROCESSED_DATA_PATH = "data/processed_wards.pkl"

def load_and_prepare_data():
    if os.path.exists(PROCESSED_DATA_PATH):
        print("Loading cached processed data...")
        with open(PROCESSED_DATA_PATH, "rb") as f:
            return pickle.load(f)

    print("Fetching fresh data. This may take a few minutes...")
    wards = gpd.read_file("data/wards.geojson")
    wards = wards.to_crs(epsg=4326)

    # Ensure all geometries are valid and strictly polygonal (Polygon or MultiPolygon)
    def clean_geometry(geom):
        if geom is None:
            return None
        # buffer(0) is a common trick to fix many geometry issues and union overlapping parts
        valid_geom = geom.buffer(0)
        if valid_geom.geom_type in ['Polygon', 'MultiPolygon']:
            return valid_geom
        if valid_geom.geom_type == 'GeometryCollection':
            polys = [g for g in valid_geom.geoms if g.geom_type in ['Polygon', 'MultiPolygon']]
            if polys:
                return unary_union(polys)
        return valid_geom

    wards['geometry'] = wards.geometry.apply(clean_geometry)

    wards_projected = wards.to_crs(epsg=3857)
    wards_projected["centroid"] = wards_projected.geometry.centroid

    wards["lat"] = wards_projected["centroid"].to_crs(epsg=4326).y
    wards["lon"] = wards_projected["centroid"].to_crs(epsg=4326).x

    # Parallelize Rainfall and Elevation API calls
    def fetch_metrics(idx_row):
        idx, row = idx_row
        lat, lon = row["lat"], row["lon"]
        try:
            rain = get_rainfall_24h(lat, lon)
            elev = get_elevation(lat, lon)
            return idx, rain, elev
        except Exception as e:
            print(f"Error fetching for {lat}, {lon}: {e}")
            return idx, 0.0, 0.0

    print(f"Calling APIs for {len(wards)} wards...")
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(fetch_metrics, wards.iterrows()))

    for idx, rain, elev in results:
        wards.at[idx, "rainfall_mm"] = rain
        wards.at[idx, "elevation_m"] = elev

    # Drainage density
    print("Fetching OpenStreetMap features (waterways)...")
    delhi_boundary = wards.geometry.union_all()
    waterways = ox.features_from_polygon(delhi_boundary, {"waterway": True})

    wards_proj = wards.to_crs(epsg=3857)
    waterways = waterways.to_crs(epsg=3857)

    wards_proj["drainage_density"] = 0.0

    print("Calculating drainage density...")
    for idx, row in wards_proj.iterrows():
        intersecting = waterways[waterways.intersects(row.geometry)]
        if not intersecting.empty:
            clipped = intersecting.clip(row.geometry)
            wards_proj.at[idx, "drainage_density"] = (
                clipped.length.sum() / row.geometry.area
            )

    wards["drainage_density"] = wards_proj["drainage_density"]

    # Impermeable ratio
    print("Fetching OpenStreetMap features (landuse)...")
    landuse = ox.features_from_polygon(delhi_boundary, {
        "landuse": ["residential", "commercial", "industrial"]
    })

    landuse = landuse.to_crs(epsg=3857)
    wards_proj["impermeable_ratio"] = 0.0

    print("Calculating impermeable ratio...")
    for idx, row in wards_proj.iterrows():
        intersecting = landuse[landuse.intersects(row.geometry)]
        if not intersecting.empty:
            clipped = intersecting.clip(row.geometry)
            wards_proj.at[idx, "impermeable_ratio"] = (
                clipped.area.sum() / row.geometry.area
            )

    wards["impermeable_ratio"] = wards_proj["impermeable_ratio"]

    # Cache the result
    with open(PROCESSED_DATA_PATH, "wb") as f:
        pickle.dump(wards, f)

    return wards


def refresh_spatial_rainfall(wards):
    """
    Intelligent Grid Sampling: Creates a 4x4 resolution weather map over Delhi 
    (16 samples) and assigns wards to the nearest point. 
    This is much faster and stays within API rate limits (60/min).
    """
    import numpy as np
    
    # 1. Bounds of Delhi Wards
    min_lat, max_lat = wards["lat"].min(), wards["lat"].max()
    min_lon, max_lon = wards["lon"].min(), wards["lon"].max()
    
    # 2. Sample 16 Points 
    lat_steps = np.linspace(min_lat, max_lat, 4)
    lon_steps = np.linspace(min_lon, max_lon, 4)
    
    samples = []
    print("Sampling spatial rainfall grid...")
    for lat in lat_steps:
        for lon in lon_steps:
            try:
                rain = get_rainfall_24h(lat, lon)
                samples.append({"lat": lat, "lon": lon, "rain": rain})
            except Exception as e:
                print(f"Sample failed for {lat}, {lon}: {e}")
                
    if not samples:
        return wards

    # 3. Assign each ward the rainfall of the nearest sample point
    print("Interpolating rainfall across wards...")
    for idx, row in wards.iterrows():
        # Find nearest point manually
        nearest = min(samples, key=lambda s: (s["lat"]-row["lat"])**2 + (s["lon"]-row["lon"])**2)
        wards.at[idx, "rainfall_mm"] = nearest["rain"]
        
    return wards
