import requests

def check_calibration():
    # 1. Initialize
    requests.get("http://127.0.0.1:5000/init")
    
    # 2. Predict for 250mm
    res = requests.get("http://127.0.0.1:5000/predict?rain=250")
    data = res.json()
    
    probs = [d['flood_probability'] for d in data]
    avg_prob = sum(probs) / len(probs)
    max_prob = max(probs)
    
    print(f"Rain: 250mm | Avg Prob: {avg_prob*100:.1f}% | Max Prob: {max_prob*100:.1f}%")
    
    # 3. Check features
    print(f"Sample First Ward: {data[0]['WardName']} | Prob: {data[0]['flood_probability']*100:.1f}%")

if __name__ == "__main__":
    try:
        check_calibration()
    except Exception as e:
        print(f"Error: {e}")
