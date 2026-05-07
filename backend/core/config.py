from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jakarta Flood Risk Dashboard API"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Path configuration
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    OUTPUTS_DIR: Path = DATA_DIR / "outputs"
    MODELS_DIR: Path = DATA_DIR / "models"
    
    # Files
    CSV_PATH: Path = DATA_DIR / "JakartaFlood.csv"
    RF_MODEL_PATH: Path = MODELS_DIR / "rf_model.joblib"
    XGB_MODEL_PATH: Path = MODELS_DIR / "xgb_model.joblib"
    SCALER_PATH: Path = MODELS_DIR / "scaler.joblib"
    
    # Output JSONs
    REGION_RF_PATH: Path = OUTPUTS_DIR / "region_rf.json"
    REGION_XGB_PATH: Path = OUTPUTS_DIR / "region_xgb.json"
    REGION_ENSEMBLE_PATH: Path = OUTPUTS_DIR / "region_ensemble.json"
    ANALYTICS_PATH: Path = OUTPUTS_DIR / "analytics.json"
    RIVERS_GEOJSON_PATH: Path = OUTPUTS_DIR / "rivers.geojson"
    BUFFER_GEOJSON_PATH: Path = OUTPUTS_DIR / "flood_buffer.geojson"
    TEST_PREDICTIONS_PATH: Path = OUTPUTS_DIR / "test_predictions.csv"

    class Config:
        env_file = ".env"

settings = Settings()
