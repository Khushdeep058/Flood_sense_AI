import os
import logging
from flask import Flask, send_file, request, jsonify, redirect, session
from flask_cors import CORS
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow

load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from routes.init import init_bp
from routes.predict import predict_bp
from routes.map import map_bp

# ✅ CONFIGURE PROFESSIONAL LOGGING
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("flood_sense.log")
    ]
)
logger = logging.getLogger("FloodSense")

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "hackathon_secret_123")
CORS(app)

# ---- Gmail OAuth Config ----
CLIENT_SECRETS_FILE = "client_secret.json"
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]
REDIRECT_URI = "http://127.0.0.1:5000/oauth2callback"

@app.route("/")
def home():
    return """
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1 style="color: #47eaed;">FloodSense Dashboard API</h1>
        <p>Authorize the Gmail API to enable automated flood alerts.</p>
        <a href='/authorize' style="background: #47eaed; color: #10141a; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Authorize Gmail Access</a>
    </div>
    """

@app.route("/authorize")
def authorize():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    auth_url, state = flow.authorization_url(
        access_type="offline", include_granted_scopes="true", prompt="consent"
    )
    session["state"] = state
    session["code_verifier"] = flow.code_verifier
    return redirect(auth_url)

@app.route("/oauth2callback")
def oauth2callback():
    state = session.get("state")
    code_verifier = session.get("code_verifier")
    
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state, redirect_uri=REDIRECT_URI
    )
    flow.code_verifier = code_verifier
    
    try:
        flow.fetch_token(authorization_response=request.url)
    except Exception as e:
        logger.error(f"Token fetch failed: {e}")
        return f"<h3>❌ Token fetch failed: {e}</h3><p>Please try starting from <a href='/authorize'>/authorize</a> again.</p>"
        
    creds = flow.credentials
    with open("token.json", "w") as f:
        f.write(creds.to_json())
    return "<h3>✅ Authorization successful! Gmail API is now active for Flood Alerts.</h3>"

@app.route("/get_map_html")
def get_map_html():
    if os.path.exists("map.html"):
        return send_file("map.html")
    return "Map not found", 404

@app.route("/get_wards_geojson")
def get_wards_geojson():
    if os.path.exists("data/wards.geojson"):
        return send_file("data/wards.geojson")
    return "GeoJSON not found", 404

# ✅ REGISTER BLUEPRINTS
app.register_blueprint(init_bp)
app.register_blueprint(predict_bp)
app.register_blueprint(map_bp)

if __name__ == "__main__":
    app.run(debug=True)