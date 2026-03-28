from flask import Blueprint, jsonify, request
import folium
from utils import state

map_bp = Blueprint("map", __name__)

@map_bp.route("/map", methods=["GET"])
def get_map():
    if state.wards_data is None or state.model is None:
        return jsonify({"error": "Model not initialized. Please call /init first."}), 400

    rain_arg = request.args.get("rain", "50")
    wards = state.wards_data.copy()
    model = state.model

    # ----------------------------
    # 🌧 Handle Rain Input
    # ----------------------------
    if rain_arg.lower() == "real":
        pass
    else:
        try:
            wards["rainfall_mm"] = float(rain_arg)
        except ValueError:
            return jsonify({"error": "Rain must be 'real' or a number"}), 400

    # ----------------------------
    # ✅ NEW FEATURE
    # ----------------------------
    wards["distance_to_water"] = 1 / (wards["drainage_density"] + 1e-5)

    # ----------------------------
    # 📊 Feature Matrix
    # ----------------------------
    X = wards[[
        "rainfall_mm",
        "elevation_m",
        "drainage_density",
        "impermeable_ratio"
    ]]

    # ----------------------------
    # 🤖 Prediction
    # ----------------------------
    probabilities = model.predict_proba(X)

    if probabilities.shape[1] == 2:
        wards["flood_probability"] = probabilities[:, 1]
    else:
        if model.classes_[0] == 1:
            wards["flood_probability"] = probabilities[:, 0]
        else:
            wards["flood_probability"] = 0.0

    # ----------------------------
    # 🔥 Smooth probabilities
    # ----------------------------
    wards["flood_probability"] = wards["flood_probability"] ** 0.7

    # ----------------------------
    # 🗺 Create Map
    # ----------------------------
    m = folium.Map(location=[28.6, 77.2], zoom_start=11)

    def get_color(prob):
        if prob > 0.8:
            return "darkred"
        elif prob > 0.6:
            return "red"
        elif prob > 0.45:
            return "orange"
        elif prob > 0.3:
            return "yellow"
        else:
            return "green"

    for _, row in wards.iterrows():
        folium.GeoJson(
            row.geometry,
            style_function=lambda x, prob=row["flood_probability"]: {
                "fillColor": get_color(prob),
                "color": "black",
                "weight": 1,
                "fillOpacity": 0.6,
            }
        ).add_to(m)

    # ----------------------------
    # 💾 Save Map
    # ----------------------------
    m.save("map.html")

    return jsonify({"message": "Map generated successfully"})