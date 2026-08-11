import json
import pandas as pd

# Read the parquet file
df = pd.read_parquet('/Users/bethlarsen/Downloads/hybas_linkno_pairs.parquet')

print(df.columns)

# Create lookup dictionary
lookup = {
    str(row.HYBAS_ID): {
        "riverID": int(row.LINKNO)
    }
    for _, row in df.iterrows()
}

# Save as JSON
with open("/Users/bethlarsen/Downloads/Hydro Lab/hydro_sos_dashboard/public/outlet_lookup.json", "w") as f:
    json.dump(lookup, f, indent=2)

print(f"Wrote {len(lookup)} lookup entries.")
