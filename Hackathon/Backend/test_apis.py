import requests
from config import API_KEY

def test_rainfall(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    print(f"Testing rainfall for {lat}, {lon}")
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(response.json())

def test_elevation(lat, lon):
    url = f"https://api.open-elevation.com/api/v1/lookup?locations={lat},{lon}"
    print(f"Testing elevation for {lat}, {lon}")
    response = requests.get(url)
    print(f"Status: {response.status_status_code if hasattr(response, 'status_status_code') else 'Unknown'}")
    # Wait, it's response.status_code
    print(f"Status Code: {response.status_code}")
    print(response.json())

if __name__ == "__main__":
    test_rainfall(28.6, 77.2)
    test_elevation(28.6, 77.2)
