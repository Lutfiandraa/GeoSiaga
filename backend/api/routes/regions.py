from fastapi import APIRouter, HTTPException
from ...core.model_loader import get_app_state

router = APIRouter()

@router.get("")
async def get_all_regions():
    state = get_app_state()
    if state["region_ensemble"] is None:
        raise HTTPException(status_code=404, detail="Region data not loaded")
    
    # Return list of regions with ensemble risk
    return state["region_ensemble"].to_dict(orient="records")

@router.get("/{region_name}")
async def get_region_detail(region_name: str):
    state = get_app_state()
    
    results = {}
    for model_key in ["region_rf", "region_xgb", "region_ensemble"]:
        df = state[model_key]
        if df is not None:
            region_data = df[df['region_name'] == region_name]
            if not region_data.empty:
                results[model_key.replace("region_", "")] = region_data.iloc[0].to_dict()
    
    if not results:
        raise HTTPException(status_code=404, detail=f"Region {region_name} not found")
    
    return results

@router.get("/compare/all")
async def compare_all_models():
    state = get_app_state()
    if state["region_ensemble"] is None:
        raise HTTPException(status_code=404, detail="Comparison data not loaded")
    
    # Return combined data for comparison charts
    rf = state["region_rf"]
    xgb = state["region_xgb"]
    ens = state["region_ensemble"]
    
    comparison = []
    for region in ens['region_name'].unique():
        comparison.append({
            "region_name": region,
            "rf": rf[rf['region_name'] == region].iloc[0].to_dict() if rf is not None else {},
            "xgb": xgb[xgb['region_name'] == region].iloc[0].to_dict() if xgb is not None else {},
            "ensemble": ens[ens['region_name'] == region].iloc[0].to_dict()
        })
    
    return comparison
