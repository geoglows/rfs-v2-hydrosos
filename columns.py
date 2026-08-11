import geopandas as gpd

gdf = gpd.read_file('/Users/bethlarsen/Downloads/hydrobasins_with_geoglows_lookup.gpkg')

print(gdf.columns)

gdf = gdf[
    [
        "HYBAS_ID",
        "LINKNO",
        "DSLINKNO",
        "DSContArea",
        "UP_AREA_x",
        "Confidence",
        "geometry"
    ]
]

gdf["geometry"] = gdf["geometry"].simplify(
    0.01,
    preserve_topology=True
)

gdf.to_file(
    "hydrobasins_web.geojson",
    driver="GeoJSON"
)
