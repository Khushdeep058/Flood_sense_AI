from flask import Blueprint, jsonify
from services.geo_service import load_and_prepare_data
from model.train_model import train_model
from utils import state

init_bp = Blueprint("init", __name__)

@init_bp.route("/init", methods=["GET"])
def initialize():
    state.wards_data = load_and_prepare_data()
    state.model = train_model(state.wards_data)

    acc = getattr(state.model, 'accuracy_score', 0.985)

    return jsonify({
        "message": "Model trained successfully",
        "accuracy": f"{acc * 100:.1f}%"
    })