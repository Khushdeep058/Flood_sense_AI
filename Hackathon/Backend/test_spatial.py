import pandas as pd
import numpy as np
from model.train_model import train_model

def test_spatial_variation():
    print("Training model...")
    model = train_model()
    
    # Test cases: rain_mm, elevation_m, drainage_density, impermeable_ratio
    # Feature 1: Low elevation, high impermeable (Riskier)
    # Feature 2: High elevation, low impermeable (Safer)
    test_data = pd.DataFrame([
        [50, 10, 0.001, 0.8], # Ward A: Flat, Concrete, 50mm rain
        [50, 500, 0.05, 0.1], # Ward B: Hilly, Green, 50mm rain
        [100, 10, 0.001, 0.8], # Ward A: 100mm rain
        [100, 500, 0.05, 0.1], # Ward B: 100mm rain
    ], columns=['rainfall_mm', 'elevation_m', 'drainage_density', 'impermeable_ratio'])
    
    probs = model.predict_proba(test_data)[:, 1]
    
    print("\nSpatial Variation Results (at same rainfall):")
    print(f"50mm Rain | Ward A (Riskier): {probs[0]*100:5.1f}%")
    print(f"50mm Rain | Ward B (Safer)  : {probs[1]*100:5.1f}%")
    print(f"100mm Rain| Ward A (Riskier): {probs[2]*100:5.1f}%")
    print(f"100mm Rain| Ward B (Safer)  : {probs[3]*100:5.1f}%")

if __name__ == "__main__":
    test_spatial_variation()
