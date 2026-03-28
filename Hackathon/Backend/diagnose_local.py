import sys
import os
import pandas as pd
import logging

# Setup path
sys.path.append(os.getcwd())

from services.geo_service import load_and_prepare_data
from model.train_model import train_model

def diagnose_local(rain_val=250.0):
    print(f"--- LOCAL DIAGNOSIS (Rain: {rain_val}mm) ---")
    
    # 1. Prepare Wards (Delhi map)
    print("Step 1: Preparing Delhi Wards...")
    wards = load_and_prepare_data()
    
    # 2. Train Model (on INDOFLOODS)
    print("Step 2: Training Model (XGBoost + INDOFLOODS)...")
    model = train_model(wards)
    print(f"Model trained with {getattr(model, 'accuracy_score', 0)*100:.1f}% accuracy.")
    
    # 3. Simulate Prediction
    print("Step 3: Calculating Risk Probabilities...")
    wards["rainfall_mm"] = rain_val
    features = ["rainfall_mm", "elevation_m", "drainage_density", "impermeable_ratio"]
    X = wards[features]
    
    # Run XGBoost Probability
    probs = model.predict_proba(X)
    wards["flood_probability"] = (probs[:, 1] ** 0.7) # applying UI smoothing factor
    
    avg_p = wards["flood_probability"].mean()
    max_p = wards["flood_probability"].max()
    min_p = wards["flood_probability"].min()
    
    print("\n--- RESULTS ---")
    print(f"Average Probability: {avg_p*100:.1f}%")
    print(f"Max Risk Ward: {wards.loc[wards['flood_probability'].idxmax(), 'WardName']} ({max_p*100:.1f}%)")
    print(f"Min Risk Ward: {wards.loc[wards['flood_probability'].idxmin(), 'WardName']} ({min_p*100:.1f}%)")
    
    # 4. Show Top 5 At-Risk Wards
    top_5 = wards.nlargest(5, "flood_probability")[["WardName", "flood_probability", "elevation_m", "drainage_density"]]
    print("\n--- TOP 5 RISK WARDS ---")
    print(top_5)

if __name__ == "__main__":
    # Silence logging for clean output
    logging.getLogger("FloodSense").setLevel(logging.ERROR)
    diagnose_local()
