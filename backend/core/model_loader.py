import joblib
import json
import pandas as pd
from .config import settings

# Global state to hold models and data in memory
app_state = {
    "rf_model": None,
    "xgb_model": None,
    "scaler": None,
    "region_rf": None,
    "region_xgb": None,
    "region_ensemble": None,
    "analytics": None,
    "rivers_geojson": None,
    "buffer_geojson": None,
    "test_predictions": None,
}

def load_all_assets():
    """Load models and data outputs into memory."""
    try:
        # Load models
        if settings.RF_MODEL_PATH.exists():
            app_state["rf_model"] = joblib.load(settings.RF_MODEL_PATH)
        if settings.XGB_MODEL_PATH.exists():
            app_state["xgb_model"] = joblib.load(settings.XGB_MODEL_PATH)
        if settings.SCALER_PATH.exists():
            app_state["scaler"] = joblib.load(settings.SCALER_PATH)

        # Load DataFrames (JSON)
        if settings.REGION_RF_PATH.exists():
            app_state["region_rf"] = pd.read_json(settings.REGION_RF_PATH)
        if settings.REGION_XGB_PATH.exists():
            app_state["region_xgb"] = pd.read_json(settings.REGION_XGB_PATH)
        if settings.REGION_ENSEMBLE_PATH.exists():
            app_state["region_ensemble"] = pd.read_json(settings.REGION_ENSEMBLE_PATH)

        # Load Analytics
        if settings.ANALYTICS_PATH.exists():
            with open(settings.ANALYTICS_PATH, 'r') as f:
                app_state["analytics"] = json.load(f)

        # Load GeoJSONs
        if settings.RIVERS_GEOJSON_PATH.exists():
            with open(settings.RIVERS_GEOJSON_PATH, 'r') as f:
                app_state["rivers_geojson"] = json.load(f)
        if settings.BUFFER_GEOJSON_PATH.exists():
            with open(settings.BUFFER_GEOJSON_PATH, 'r') as f:
                app_state["buffer_geojson"] = json.load(f)

        # Load CSV
        if settings.TEST_PREDICTIONS_PATH.exists():
            app_state["test_predictions"] = pd.read_csv(settings.TEST_PREDICTIONS_PATH)

        print("All assets loaded into memory successfully.")
    except Exception as e:
        print(f"Error loading assets: {e}")

def get_app_state():
    return app_state
