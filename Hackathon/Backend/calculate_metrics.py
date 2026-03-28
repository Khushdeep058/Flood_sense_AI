import pandas as pd
import os
import sys
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

data_dir = r"c:\Users\khush\Desktop\Hackathon\Backend\data"

def calculate_metrics():
    # 1. Load Files
    chars = pd.read_csv(os.path.join(data_dir, "catchment_characteristics_indofloods.csv"))
    meta = pd.read_csv(os.path.join(data_dir, "metadata_indofloods.csv"))
    events = pd.read_csv(os.path.join(data_dir, "floodevents_indofloods.csv"))
    rain = pd.read_csv(os.path.join(data_dir, "precipitation_variables_indofloods.csv"))
    
    for d in [chars, meta, events, rain]: d.columns = d.columns.str.strip()
    
    def get_gid(eid): return "-".join(str(eid).split("-")[:-1])
    events['GaugeID'] = events['EventID'].apply(get_gid)
    rain['GaugeID'] = rain['EventID'].apply(get_gid)

    station_info = meta.merge(chars, on="GaugeID", how="inner")
    event_data = events.merge(rain, on=["EventID", "GaugeID"], how="inner")
    df_real = event_data.merge(station_info, on="GaugeID", how="inner")

    df_real['flood_label'] = 1
    df_real['rainfall_mm'] = df_real['T1d']
    df_real['elevation_m'] = df_real['Catchment Relief']
    df_real['drainage_density'] = df_real['Drainage Density']
    df_real['impermeable_ratio'] = df_real['Urban percentage'].fillna(0) / 100.0

    neg_samples = []
    for _, row in station_info.iterrows():
        for _ in range(15):
            neg_samples.append({
                'rainfall_mm': np.random.uniform(0, 40), 
                'elevation_m': row['Catchment Relief'],
                'drainage_density': row['Drainage Density'],
                'impermeable_ratio': row['Urban percentage'] / 100.0 if row['Urban percentage'] > 0 else 0.5,
                'flood_label': 0
            })
    df_neg = pd.DataFrame(neg_samples)

    df_train = pd.concat([
        df_real[['rainfall_mm', 'elevation_m', 'drainage_density', 'impermeable_ratio', 'flood_label']],
        df_neg
    ], ignore_index=True).dropna().fillna(0)

    X = df_train[['rainfall_mm', 'elevation_m', 'drainage_density', 'impermeable_ratio']]
    y = df_train['flood_label']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, eval_metric='logloss')
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print(f"Final Accuracy: {acc*100:.2f}%")
    print(f"Final F1 Score: {f1*100:.2f}%")

if __name__ == "__main__":
    calculate_metrics()
