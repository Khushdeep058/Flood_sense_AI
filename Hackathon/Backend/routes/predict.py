import logging
from flask import Blueprint, jsonify, request
from utils import state

predict_bp = Blueprint("predict", __name__)
logger = logging.getLogger("FloodSense.Predict")

@predict_bp.route("/predict", methods=["GET"])
def predict():
    logger.info("Accessing /predict endpoint")
    if state.wards_data is None or state.model is None:
        return jsonify({"error": "Model not initialized. Please call /init first."}), 400

    rain_arg = request.args.get("rain", "50")
    wards = state.wards_data.copy()
    model = state.model

    # ----------------------------
    # 🌧 Handle Rain Input
    # ----------------------------
    if rain_arg.lower() == "real":
        logger.info("Using spatial-aware real-time rainfall data")
        
        import time
        from services.geo_service import refresh_spatial_rainfall
        
        now = time.time()
        # Cache for 1 hour to respect API limits but keep it fresh
        if now - state.last_weather_update > 3600: 
            logger.info("Refreshing spatial weather grid from API...")
            try:
                # This fetches a grid and interpolates for all 251 wards
                state.wards_data = refresh_spatial_rainfall(state.wards_data)
                state.last_weather_update = now
            except Exception as e:
                logger.error(f"Failed spatial refresh: {e}")
        
        # Use updated values from main state
        wards["rainfall_mm"] = state.wards_data["rainfall_mm"]
    else:
        try:
            val = float(rain_arg)
            if not (0 <= val <= 1000):
                 logger.warning(f"Out of range rainfall: {val}")
                 return jsonify({"error": "Rainfall out of range (0-1000)"}), 400
            wards["rainfall_mm"] = val
            logger.info(f"Using simulated rainfall: {val}mm")
        except ValueError:
            logger.error(f"Invalid rainfall input: {rain_arg}")
            return jsonify({"error": "Rain must be 'real' or a number"}), 400

    # 📊 Feature Matrix (Must match train_model.py)
    features = ["rainfall_mm", "elevation_m", "drainage_density", "impermeable_ratio"]
    X = wards[features]

    # ----------------------------
    # 🤖 Prediction
    # ----------------------------
    probabilities = model.predict_proba(X)

    # Handle single-class scenarios
    if probabilities.shape[1] == 2:
        wards["flood_probability"] = probabilities[:, 1]
    else:
        if model.classes_[0] == 1:
            wards["flood_probability"] = probabilities[:, 0]
        else:
            wards["flood_probability"] = 0.0

    # ----------------------------
    # 🔥 NO MORE SMOOTHING (Causing false positives)
    # ----------------------------
    # wards["flood_probability"] = wards["flood_probability"] ** 0.7

    # ----------------------------
    # 📦 Response
    # ----------------------------
    result = wards[[
        "WardName",
        "flood_probability",
        "rainfall_mm",
        "elevation_m",
        "drainage_density",
        "impermeable_ratio"
    ]].to_dict(orient="records")

    return jsonify(result)

# ----------------------------
# 📧 AUTOMATED GMAIL ALERTING (Llama-Powered)
# ----------------------------
from services.notification_service import send_alert_auto, create_flood_report_pdf, generate_flood_report_llama
import os
from flask import send_file
import tempfile

@predict_bp.route("/send_alert", methods=["POST"])
def send_alert():
    """Triggers an automated flood alert (Gmail API with SMTP fallback)."""
    data = request.json
    recipient = "dipikajaiswal.hbti@gmail.com"
    ward_info = data.get("ward")

    if not ward_info:
        return jsonify({"error": "Missing ward data"}), 400

    success = send_alert_auto(recipient, ward_info)
    return jsonify({"message": "Alert processed", "success": success})

@predict_bp.route("/download_report", methods=["POST"])
def download_report():
    """Generates and returns a PDF report for direct download."""
    ward_info = request.json.get("ward")
    if not ward_info:
        return jsonify({"error": "Missing ward data"}), 400
    
    # 1. Generate Content
    html_report = generate_flood_report_llama(ward_info)
    
    # 2. Create PDF
    pdf_path = create_flood_report_pdf(ward_info, html_report)
    
    # 3. Send file and then cleanup (using a generator or after-request)
    return send_file(
        pdf_path,
        as_attachment=True,
        download_name=f"Flood_Report_{ward_info.get('WardName')}.pdf",
        mimetype="application/pdf"
    )