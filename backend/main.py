from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .core.config import settings
from .core.model_loader import load_all_assets, get_app_state
from .api.routes import predict, geojson, analytics, regions, upload

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load all assets
    load_all_assets()
    yield
    # Shutdown: Clean up if needed
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(regions.router, prefix="/api/regions", tags=["Regions"])
app.include_router(geojson.router, prefix="/api/geojson", tags=["GeoJSON"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(predict.router, prefix="/api/predict", tags=["Prediction"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])

@app.get("/")
async def health_check():
    state = get_app_state()
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "assets_loaded": {
            "rf_model": state["rf_model"] is not None,
            "xgb_model": state["xgb_model"] is not None,
            "scaler": state["scaler"] is not None,
            "analytics": state["analytics"] is not None,
            "rivers": state["rivers_geojson"] is not None,
            "buffer": state["buffer_geojson"] is not None,
            "test_predictions": state["test_predictions"] is not None
        }
    }
