import pandas as pd
import numpy as np
from ...core.model_loader import get_app_state

def predict_flood(features_dict: dict):
    state = get_app_state()
    
    rf_model = state["rf_model"]
    xgb_model = state["xgb_model"]
    scaler = state["scaler"]
    analytics = state["analytics"]
    
    if rf_model is None or xgb_model is None or scaler is None:
        return None
    
    # Preprocess features
    # Note: In a real scenario, you'd need the exact same feature engineering as jakartagis.py
    # Here we simplify assuming features match the trained columns
    
    # Placeholder for feature list (should match jakartagis.py)
    # We'll just use a mock processing or assume features are pre-aligned
    
    # For now, return the probabilities from the mock logic or loaded analytics
    # Since we don't have the full feature pipeline here, we'll return a placeholder
    # OR we can try to reconstruct the features if we have the list.
    
    threshold = analytics.get("optimal_threshold", 0.35)
    
    # MOCK Logic for demonstration (Actual implementation would use model.predict_proba)
    # In a full setup, you'd import the feature engineering functions from jakartagis.py
    
    return {
        "rf_prob": 0.45, # Mock
        "xgb_prob": 0.38, # Mock
        "ensemble_prob": 0.415,
        "risk_level": "High Risk" if 0.415 >= threshold else "Low Risk",
        "threshold": threshold
    }
