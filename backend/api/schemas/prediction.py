from pydantic import BaseModel
from typing import Optional

class WeatherFeatures(BaseModel):
    Tn: float
    Tx: float
    Tavg: float
    RH_avg: float
    RR: float
    ss: float
    ff_x: float
    ddd_x: float
    ff_avg: float
    region_name: str

class PredictionResponse(BaseModel):
    rf_prob: float
    xgb_prob: float
    ensemble_prob: float
    risk_level: str
    threshold: float
