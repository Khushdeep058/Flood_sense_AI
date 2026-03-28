from services.geo_service import load_and_prepare_data
import time

if __name__ == "__main__":
    start = time.time()
    print("Starting data preparation...")
    data = load_and_prepare_data()
    print(f"Done in {time.time() - start:.2f} seconds")
    print(data.head())
