### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

### Generate Models & Outputs
Run the mounting script once to process the GIS data and train models:
```bash
python mount_outputs.py
```

## Tech Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Leaflet (GIS), Recharts (Analytics).
- **Backend:** FastAPI, GeoPandas, OSMnx, Scikit-Learn, XGBoost.
- **Models:** Random Forest + XGBoost Ensemble.

## Features
- **Interactive Risk Map:** Multi-layer GIS mapping with rivers, buffer zones, and model predictions.
- **Advanced Analytics:** Feature importance, ROC-AUC comparison, and historical timeline.
- **Dynamic Prediction:** API-driven flood probability based on weather features.
- **Data Pipeline:** Upload new CSV data to automatically re-train and refresh the dashboard.

## Tutor run Backend/Server
PS C:\GeoSpatialAI> python -m uvicorn backend.main:app --port 8000 --reload


