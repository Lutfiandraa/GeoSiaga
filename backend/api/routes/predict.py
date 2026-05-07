from fastapi import APIRouter, HTTPException
from ..schemas.prediction import WeatherFeatures, PredictionResponse
from ..services.ml_service import predict_flood

router = APIRouter()

@router.post("", response_model=PredictionResponse)
async def perform_prediction(features: WeatherFeatures):
    result = predict_flood(features.dict())
    if result is None:
        raise HTTPException(status_code=503, detail="Models not loaded")
    return result
