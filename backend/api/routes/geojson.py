from fastapi import APIRouter, HTTPException
from ...core.model_loader import get_app_state

router = APIRouter()

@router.get("/rivers")
async def get_rivers_geojson():
    state = get_app_state()
    if state["rivers_geojson"] is None:
        raise HTTPException(status_code=404, detail="Rivers GeoJSON not loaded")
    return state["rivers_geojson"]

@router.get("/buffer")
async def get_buffer_geojson():
    state = get_app_state()
    if state["buffer_geojson"] is None:
        raise HTTPException(status_code=404, detail="Buffer GeoJSON not loaded")
    return state["buffer_geojson"]

@router.get("/heatmap")
async def get_heatmap_data():
    state = get_app_state()
    if state["test_predictions"] is None:
        raise HTTPException(status_code=404, detail="Heatmap data not loaded")
    
    # Return list of {lat, lng, prob} for ensemble heatmap
    df = state["test_predictions"]
    heatmap_data = df[['latitude', 'longitude', 'prob_ensemble']].rename(
        columns={'latitude': 'lat', 'longitude': 'lng', 'prob_ensemble': 'prob'}
    ).to_dict(orient="records")
    
    return heatmap_data

@router.get("/actual-events")
async def get_actual_events():
    state = get_app_state()
    if state["test_predictions"] is None:
        raise HTTPException(status_code=404, detail="Actual events data not loaded")
    
    # Filter only actual flood events (where flood == 1)
    df = state["test_predictions"]
    events = df[df['flood'] == 1][['date', 'region_name', 'latitude', 'longitude']].to_dict(orient="records")
    return events
