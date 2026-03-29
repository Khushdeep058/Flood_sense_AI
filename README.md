# Flood_sense_AI
#  FloodSense: AI-Powered Urban Flood Prediction System

 **An intelligent full-stack system that predicts urban flood risk at ward-level using AI + GIS + real-time data**

---

##  Overview

FloodSense is a smart flood prediction system that combines **machine learning, geospatial analysis, and real-time data** to estimate flood probability in urban areas.

Unlike traditional systems that provide city-level alerts, FloodSense delivers **localized, ward-level predictions**, enabling better decision-making for disaster management.

---

##  Key Features

*  Real-time rainfall integration (OpenWeather API)
*  GIS-based spatial analysis
* XGBoost machine learning model
*  Ward-level flood probability prediction
*  Interactive map visualization (Leaflet)
*  REST API-based architecture

---

##  How It Works

1. Collects real-time + geospatial data
2. Extracts key flood-related features
3. Trains ML model using hybrid dataset
4. Predicts flood probability via API
5. Visualizes results on interactive map

---

##  System Architecture

Frontend (React + Leaflet)
⬇
Backend (Flask API)
⬇
ML Model (XGBoost)
⬇
Geospatial Processing (GeoPandas, Rasterio, OSMnx)

---

##  Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Frontend  | React.js, Leaflet          |
| Backend   | Flask (Python)             |
| ML Model  | XGBoost, Scikit-learn      |
| GIS Tools | GeoPandas, Rasterio, OSMnx |
| APIs      | OpenWeather API            |

---

##  Data Sources

*  OpenWeather API (Rainfall data)
*  SRTM Dataset (.tif) for elevation
*  OpenStreetMap (Drainage + Land Use)
*  Zenodo Flood Dataset (Real-world training data)
*  Synthetic dataset for augmentation

---

##  Features Used in Model

* Rainfall (mm)
* Elevation (m)
* Drainage Density
* Impermeable Ratio
* Distance to Water

---

##  Machine Learning Model

* Model: **XGBoost (Gradient Boosting)**
* Handles complex non-linear relationships
* Better performance than RandomForest
* Optimized using:

  * Hyperparameter tuning
  * Regularization
  * Class balancing

---

##  Results

* ✅ Accuracy: **85.3%**
* ✅ F1 Score: **0.87**
* 📉 Reduced overfitting with real-world data
* 📊 Stable and realistic probability outputs

---

##  Visualization

* Color-coded flood risk zones:

  * 🟢 Low Risk
  * 🟡 Medium Risk
  * 🔴 High Risk

* Interactive ward-level map insights

---

##  API Endpoints

| Endpoint   | Description                  |
| ---------- | ---------------------------- |
| `/init`    | Load data & train model      |
| `/predict` | Get flood probability        |
| `/map`     | Generate flood visualization |

---

##  Challenges Faced

* CRS mismatch in geospatial data
* Elevation API failures
* Lack of labeled flood datasets
* Model overfitting
* Geometry errors in GeoPandas

---

## Solutions Implemented

* Hybrid elevation system (SRTM + fallback)
* CRS transformation fixes
* Geometry validation pipeline
* Switched to XGBoost
* Probability smoothing

---
## Future Enhancements

* Time-series rainfall prediction (LSTM)
* Real-time alert system (SMS/Push)
* Mobile application
* IoT sensor integration
* More real-world datasets

---

##  Why This Project Stands Out

✅ Combines AI + GIS + Full-stack
✅ Real-world problem solving
✅ Scalable architecture
✅ Practical disaster management application

---


##  Setup Instructions

```bash
# Clone repository
git clone https://github.com/your-username/floodsense

# Backend setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend setup
cd frontend
npm install
npm start
```

---

##  Contributors

* Khush Deep Singh
* Jenny Prasad
