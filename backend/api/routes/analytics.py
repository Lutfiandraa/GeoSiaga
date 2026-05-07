from fastapi import APIRouter, HTTPException
from ...core.model_loader import get_app_state
import pandas as pd

router = APIRouter()

@router.get("")
async def get_analytics_summary():
    state = get_app_state()
    if state["analytics"] is None:
        raise HTTPException(status_code=404, detail="Analytics summary not loaded")
    return state["analytics"]

@router.get("/timeline")
async def get_flood_timeline():
    state = get_app_state()
    if state["test_predictions"] is None:
        raise HTTPException(status_code=404, detail="Timeline data not loaded")
    
    df = state["test_predictions"].copy()
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by month
    timeline = df.groupby(df['date'].dt.strftime('%Y-%m')).agg(
        flood_days = ('flood', 'sum'),
        avg_prob = ('prob_ensemble', 'mean')
    ).reset_index().rename(columns={'date': 'month'})
    
    return timeline.to_dict(orient="records")
