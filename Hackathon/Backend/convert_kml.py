import geopandas as gpd

kml_file = "data/delhi_wards.kml"
geojson_file = "data/wards.geojson"

gdf = gpd.read_file(kml_file, driver="KML")
gdf.to_file(geojson_file, driver="GeoJSON")

print("Converted successfully!")