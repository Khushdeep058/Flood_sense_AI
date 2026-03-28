import pandas as pd
import os
import logging
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

logger = logging.getLogger("FloodSense.Training")

def train_model(wards_context=None):
    """
    Trains on INDOFLOODS (IIT Delhi). Uses negative sampling for binary classification.
    """
    current_dir = os.path.dirname(__file__)
    data_dir = os.path.abspath(os.path.join(current_dir, "..", "data"))
    
    try:
        # 1. Load Station Data
        chars = pd.read_csv(os.path.join(data_dir, "catchment_characteristics_indofloods.csv"))
        meta = pd.read_csv(os.path.join(data_dir, "metadata_indofloods.csv"))
        for d in [chars, meta]: d.columns = d.columns.str.strip()
        
        # 2. Load Flood & Rain
        events = pd.read_csv(os.path.join(data_dir, "floodevents_indofloods.csv"))
        rain = pd.read_csv(os.path.join(data_dir, "precipitation_variables_indofloods.csv"))
        for d in [events, rain]: d.columns = d.columns.str.strip()

        # 3. Merging
        def get_gid(eid): return "-".join(str(eid).split("-")[:-1])
        events['GaugeID'] = events['EventID'].apply(get_gid)
        rain['GaugeID'] = rain['EventID'].apply(get_gid)

        station_info = meta.merge(chars, on="GaugeID", how="inner")
        event_data = events.merge(rain, on=["EventID", "GaugeID"], how="inner")
        df_real = event_data.merge(station_info, on="GaugeID", how="inner")

        # Prepare Positive Samples
        df_real['flood_label'] = 1
        df_real['rainfall_mm'] = df_real['T1d']
        df_real['elevation_m'] = df_real['Catchment Relief']
        df_real['drainage_density'] = df_real['Drainage Density']
        df_real['impermeable_ratio'] = df_real['Urban percentage'].fillna(0) / 100.0

        # Filtering positives that are likely not rain-based floods or too ambiguous
        df_real = df_real[df_real['rainfall_mm'] > 50].copy()

        # 4. Negative Sampling (Enhanced)
        neg_samples = []
        for _, row in station_info.iterrows():
            # Random dry days
            for _ in range(25):
                neg_samples.append({
                    'rainfall_mm': np.random.uniform(0, 15), # Low rain = No flood
                    'elevation_m': row['Catchment Relief'],
                    'drainage_density': row['Drainage Density'],
                    'impermeable_ratio': row['Urban percentage'] / 100.0 if row['Urban percentage'] > 0 else 0.5,
                    'flood_label': 0
                })
            # Explicit ZERO rain cases for all relief levels
            neg_samples.append({
                'rainfall_mm': 0,
                'elevation_m': row['Catchment Relief'],
                'drainage_density': row['Drainage Density'],
                'impermeable_ratio': row['Urban percentage'] / 100.0 if row['Urban percentage'] > 0 else 0.5,
                'flood_label': 0
            })
            
        # Add special "flat area" (Delhi-like) negative samples
        for r in [5, 10, 20, 50, 100, 200, 300]:
            for rain in [0, 5, 10, 20]:
                neg_samples.append({
                    'rainfall_mm': rain,
                    'elevation_m': r,
                    'drainage_density': 0.01,
                    'impermeable_ratio': 0.6,
                    'flood_label': 0
                })

        df_neg = pd.DataFrame(neg_samples)
        
        # 4.5 NEW: Add Delhi-Specific Synthetic Data (to guide the model on local features)
        # Delhi: Low Elevation = High Risk, Low Drainage = High Risk, High Urban = High Risk
        delhi_samples = []
        for _ in range(1000):
            rain = np.random.uniform(20, 150)
            elev = np.random.uniform(195, 250) # Delhi elevation range
            drain = np.random.uniform(0, 0.05)
            urban = np.random.uniform(0, 1.0)
            
            # Simple rule-based label for synthetic guidance
            # Risk increases with rain and urban, decreases with elev and drainage
            score = (rain/100.0) + (urban * 0.5) - ((elev-195)/50.0) - (drain * 10)
            label = 1 if score > 0.8 else 0
            delhi_samples.append({
                'rainfall_mm': rain,
                'elevation_m': elev,
                'drainage_density': drain,
                'impermeable_ratio': urban,
                'flood_label': label
            })
        df_delhi = pd.DataFrame(delhi_samples)

        # 5. Final Dataset (Balance weight to avoid bias)
        df_train = pd.concat([
            df_real[['rainfall_mm', 'elevation_m', 'drainage_density', 'impermeable_ratio', 'flood_label']],
            df_neg,
            df_delhi
        ], ignore_index=True).dropna()

        X = df_train[['rainfall_mm', 'elevation_m', 'drainage_density', 'impermeable_ratio']]
        y = df_train['flood_label']

        # 6. Train XGBoost
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, eval_metric='logloss')
        model.fit(X_train, y_train)

        acc = accuracy_score(y_test, model.predict(X_test))
        logger.info(f"TRAINING SUCCESS! Accuracy: {acc*100:.1f}% on {len(df_train)} samples.")
        
        model.accuracy_score = acc
        return model

    except Exception as e:
        logger.error(f"INDOFLOODS Training Failed: {e}")
        from sklearn.ensemble import RandomForestClassifier
        fallback = RandomForestClassifier(n_estimators=1).fit(np.zeros((1,4)), [0])
        fallback.accuracy_score = 0.0
        return fallback