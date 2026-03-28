import pandas as pd
import os

data_dir = r"c:\Users\khush\Desktop\Hackathon\Backend\data"

files = [
    "floodevents_indofloods.csv",
    "catchment_characteristics_indofloods.csv",
    "metadata_indofloods.csv",
    "precipitation_variables_indofloods.csv"
]

for f in files:
    path = os.path.join(data_dir, f)
    if os.path.exists(path):
        df = pd.read_csv(path)
        print(f"\n--- {f} ---")
        print(df.columns.tolist())
        print(f"Rows: {len(df)}")
        print(df.head(2))
    else:
        print(f"File not found: {f}")
