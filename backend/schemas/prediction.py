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
    ff_avg: float
    month: int
    latitude: float
    longitude: float
    # Optional features if the model needs more
    year: Optional[int] = 2024
    day_of_year: Optional[int] = 1
    week_of_year: Optional[int] = 1
    season: Optional[int] = 1
    RR_rolling3: Optional[float] = 0.0
    RR_cumsum3: Optional[float] = 0.0
    # ... and others

class PredictionResponse(BaseModel):
    rf_prob: float
    xgb_prob: float
    ensemble_prob: float
    risk_level: str
    threshold: float
