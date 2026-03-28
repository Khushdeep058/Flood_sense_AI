import sys
import os
import logging

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from model.train_model import train_model

# Set up logging to see output
logging.basicConfig(level=logging.INFO)

if __name__ == "__main__":
    print("Testing XGBoost with INDOFLOODS...")
    try:
        model = train_model()
        if model:
            print(f"Successfully trained model with accuracy: {getattr(model, 'accuracy_score', 'N/A')}")
    except Exception as e:
        print(f"Failed to train model: {e}")
