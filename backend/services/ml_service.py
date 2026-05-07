import pandas as pd
import numpy as np
from ..core.model_loader import get_app_state

def predict_flood(features_dict: dict):
    state = get_app_state()
    rf = state["rf_model"]
    xgb = state["xgb_model"]
    scaler = state["scaler"]
    analytics = state["analytics"]
    
    if any(m is None for m in [rf, xgb, scaler, analytics]):
        return None

    # Reconstruct the feature vector in correct order
    # In a real app, you'd store the feature list in config/analytics
    # Here we assume the order is what the model expects.
    # To be safe, we should have exported the feature_cols list.
    
    # For now, let's assume we have a list of features or can infer them
    # Better: Use the feature importance keys as a guide for names.
    feature_names = list(analytics["rf_feature_importance"].keys())
    
    # Create DataFrame for scaling
    X_new = pd.DataFrame([features_dict])
    
    # Fill missing features with 0 if any
    for col in feature_names:
        if col not in X_new.columns:
            X_new[col] = 0.0
            
    # Ensure order
    X_new = X_new[feature_names]
    
    # Scale
    X_scaled = scaler.transform(X_new)
    
    # Predict
    prob_rf = rf.predict_proba(X_scaled)[:, 1][0]
    prob_xgb = xgb.predict_proba(X_scaled)[:, 1][0]
    prob_ensemble = (prob_rf + prob_xgb) / 2
    
    threshold = analytics["optimal_threshold"]
    risk_level = "🟢 Low Risk"
    if prob_ensemble >= 0.6:
        risk_level = "🔴 High Risk"
    elif prob_ensemble >= 0.3:
        risk_level = "🟡 Medium Risk"
        
    return {
        "rf_prob": float(prob_rf),
        "xgb_prob": float(prob_xgb),
        "ensemble_prob": float(prob_ensemble),
        "risk_level": risk_level,
        "threshold": float(threshold)
    }
