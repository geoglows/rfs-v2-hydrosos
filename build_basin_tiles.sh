#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")"

SOURCE="${1:-public/hydrobasins_web.geojson}"
TILES="public/hydrobasins.pmtiles"
INDEX="public/basin_index.json"

if [ ! -f "$SOURCE" ]; then
  echo "Source geojson not found: $SOURCE" >&2
  echo "Pass its path as the first argument." >&2
  exit 1
fi

tippecanoe -o "$TILES" -l basins -Z0 -z6 --simplification=10 --simplify-only-low-zooms \
  --no-simplification-of-shared-nodes --no-tile-size-limit --no-feature-limit \
  --force "$SOURCE"

node --input-type=module -e "
import {readFileSync, writeFileSync} from 'node:fs';

const geojson = JSON.parse(readFileSync('$SOURCE', 'utf8'));
const index = {};
for (const feature of geojson.features) {
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity;
  const polygons =
    feature.geometry.type === 'MultiPolygon'
      ? feature.geometry.coordinates
      : [feature.geometry.coordinates];

  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        if (lon < west) west = lon;
        if (lon > east) east = lon;
        if (lat < south) south = lat;
        if (lat > north) north = lat;
      }
    }
  }
  const round = n => Math.round(n * 1e5) / 1e5;
  index[feature.properties.HYBAS_ID] = [round(west), round(south), round(east), round(north)];
}
writeFileSync('$INDEX', JSON.stringify(index));
console.log('wrote $INDEX with', Object.keys(index).length, 'basins');
"

ls -lh "$TILES" "$INDEX"
