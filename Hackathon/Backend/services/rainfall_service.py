import requests
from config import API_KEY

def get_rainfall_24h(lat, lon):
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"

    response = requests.get(url)
    data = response.json()

    total_rain = 0

    for item in data["list"][:8]:
        if "rain" in item and "3h" in item["rain"]:
            total_rain += item["rain"]["3h"]

    return total_rain