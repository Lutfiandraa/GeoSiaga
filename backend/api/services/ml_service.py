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
    
    threshold = analytics.get("optimal_threshold", 0.35)
    
    try:
        from datetime import datetime
        import numpy as np

        now = datetime.now()
        rr = features_dict["RR"]
        ss = features_dict["ss"]
        region = features_dict["region_name"]

        region_enc_map = {
            "Jakarta Selatan": 0, "Jakarta Timur": 1,
            "Jakarta Pusat": 2, "Jakarta Utara": 3
        }
        region_coords = {
            "Jakarta Selatan": (-6.2615, 106.8106),
            "Jakarta Utara":   (-6.1214, 106.9009),
            "Jakarta Pusat":   (-6.1862, 106.8341),
            "Jakarta Timur":   (-6.2250, 106.9004)
        }
        season_map = {12:0,1:0,2:0,3:1,4:1,5:1,6:2,7:2,8:2,9:3,10:3,11:3}

        lat, lon = region_coords.get(region, (-6.2, 106.8))

        deg = features_dict["ddd_x"]
        if   deg <= 44:  dir_cat = 'N'
        elif deg <= 89:  dir_cat = 'NE'
        elif deg <= 134: dir_cat = 'E'
        elif deg <= 179: dir_cat = 'SE'
        elif deg <= 224: dir_cat = 'S'
        elif deg <= 269: dir_cat = 'SW'
        elif deg <= 314: dir_cat = 'W'
        else:            dir_cat = 'NW'
        wind_cats = ['E','N','NE','NW','S','SE','SW','W']
        wind_dir_enc = wind_cats.index(dir_cat) if dir_cat in wind_cats else 0

        row = {
            "Tn":                   features_dict["Tn"],
            "Tx":                   features_dict["Tx"],
            "Tavg":                 features_dict["Tavg"],
            "RH_avg":               features_dict["RH_avg"],
            "RR":                   rr,
            "ss":                   ss,
            "ff_x":                 features_dict["ff_x"],
            "ddd_x":                features_dict["ddd_x"],
            "ff_avg":               features_dict["ff_avg"],
            "year":                 now.year,
            "month":                now.month,
            "day_of_year":          now.timetuple().tm_yday,
            "week_of_year":         int(now.strftime("%W")),
            "season":               season_map[now.month],
            "RR_rolling3":          rr,
            "RR_cumsum3":           rr * 3,
            "RR_rolling7":          rr,
            "RR_cumsum7":           rr * 7,
            "RR_rolling14":         rr,
            "RR_cumsum14":          rr * 14,
            "RR_lag1":              rr,
            "RR_lag2":              rr,
            "RR_lag3":              rr,
            "temp_range":           features_dict["Tx"] - features_dict["Tn"],
            "humid_rain_interact":  features_dict["RH_avg"] * rr,
            "wind_dir_enc":         wind_dir_enc,
            "latitude":             lat,
            "longitude":            lon,
            "region_enc":           region_enc_map.get(region, 0),
            "ss_ratio":             float(np.clip(ss / 12.5, 0, 1)),
            "ss_rolling7":          ss,
            "rain_sun_ratio":       rr / (ss + 0.1),
        }

        X = pd.DataFrame([row])
        X_scaled = scaler.transform(X)

        rf_prob  = float(rf_model.predict_proba(X_scaled)[0][1])
        xgb_prob = float(xgb_model.predict_proba(X_scaled)[0][1])
        ensemble_prob = (rf_prob + xgb_prob) / 2

        return {
            "rf_prob":       round(rf_prob, 4),
            "xgb_prob":      round(xgb_prob, 4),
            "ensemble_prob": round(ensemble_prob, 4),
            "risk_level":    "High Risk" if ensemble_prob >= threshold else "Low Risk",
            "threshold":     threshold
        }
    except Exception as e:
        print(f"[predict_flood error] {e}")
        return None
