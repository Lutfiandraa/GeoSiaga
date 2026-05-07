# -*- coding: utf-8 -*-
"""JakartaFlood_Local_Full.py"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score, recall_score, precision_score, roc_curve, auc, precision_recall_curve
from sklearn.preprocessing import LabelEncoder, StandardScaler
from imblearn.over_sampling import SMOTE
import geopandas as gpd
from shapely.geometry import Point, mapping
import folium
from folium.plugins import HeatMap, MiniMap, MeasureControl
from xgboost import XGBClassifier
import time
import warnings
import osmnx as ox
from branca.colormap import LinearColormap
import joblib
import json
from scipy import stats

warnings.filterwarnings('ignore')

# SETUP LOCAL PATHS
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OUTPUTS_DIR = os.path.join(DATA_DIR, 'outputs')
MODELS_DIR = os.path.join(DATA_DIR, 'models')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# 1. Load Data
csv_path = os.path.join(DATA_DIR, 'JakartaFlood.csv')
df = pd.read_csv(csv_path)
df['date'] = pd.to_datetime(df['date'])

print("✅ Data berhasil dimuat secara lokal!")

# ============================================================
# LOGIKA EDA, PREPROCESSING, & ML (RECONSTRUCTED)
# ============================================================

# --- Data Quality Report ---
print(f"📦 Shape: {df.shape}")

# --- Outlier Detection & Handling ---
num_cols = ['Tn','Tx','Tavg','RH_avg','RR','ss','ff_x','ddd_x','ff_avg']
df_clean = df.copy()
for col in num_cols:
    Q1 = df_clean[col].quantile(0.25)
    Q3 = df_clean[col].quantile(0.75)
    IQR = Q3 - Q1
    lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
    df_clean[col] = df_clean[col].clip(lower=lower, upper=upper)

# --- Missing Value Imputation ---
df_clean = df_clean.sort_values(['region_name', 'date']).reset_index(drop=True)
for col in num_cols:
    df_clean[col] = df_clean.groupby('region_name')[col].transform(lambda x: x.fillna(x.median()))
df_clean['ddd_car'] = df_clean.groupby('region_name')['ddd_car'].transform(lambda x: x.fillna(x.mode()[0] if not x.mode().empty else 'S'))

# --- Feature Engineering ---
df_clean['year'] = df_clean['date'].dt.year
df_clean['month'] = df_clean['date'].dt.month
df_clean['day_of_year'] = df_clean['date'].dt.dayofyear
df_clean['week_of_year'] = df_clean['date'].dt.isocalendar().week.astype(int)
df_clean['season'] = df_clean['month'].map({12:0, 1:0, 2:0, 3:1, 4:1, 5:1, 6:2, 7:2, 8:2, 9:3, 10:3, 11:3})

for window in [3, 7, 14]:
    df_clean[f'RR_rolling{window}'] = df_clean.groupby('region_name')['RR'].transform(lambda x: x.rolling(window, min_periods=1).mean())
    df_clean[f'RR_cumsum{window}'] = df_clean.groupby('region_name')['RR'].transform(lambda x: x.rolling(window, min_periods=1).sum())

for lag in [1, 2, 3]:
    df_clean[f'RR_lag{lag}'] = df_clean.groupby('region_name')['RR'].transform(lambda x: x.shift(lag))

df_clean['temp_range'] = df_clean['Tx'] - df_clean['Tn']
df_clean['humid_rain_interact'] = df_clean['RH_avg'] * df_clean['RR']
df_clean['wind_dir_enc'] = pd.Categorical(df_clean['ddd_car']).codes

region_coords = {'Jakarta Selatan': (-6.2615, 106.8106), 'Jakarta Utara': (-6.1214, 106.9009), 'Jakarta Pusat': (-6.1862, 106.8341), 'Jakarta Timur': (-6.2250, 106.9004)}
df_clean['latitude']  = df_clean['region_name'].map(lambda x: region_coords[x][0])
df_clean['longitude'] = df_clean['region_name'].map(lambda x: region_coords[x][1])
df_clean['region_enc'] = pd.Categorical(df_clean['region_name']).codes
df_clean = df_clean.dropna(subset=['RR_lag1', 'RR_lag2', 'RR_lag3']).reset_index(drop=True)

# --- SS Fix & Features ---
df_clean['ss'] = df_clean.groupby(['region_name', 'month'])['ss'].transform(lambda x: x.fillna(x.median()))
df_clean['ss'] = df_clean.groupby('region_name')['ss'].transform(lambda x: x.fillna(x.median()))
df_clean['ss'] = df_clean['ss'].fillna(df_clean['ss'].median())
df_clean['ss_ratio'] = (df_clean['ss'] / 12.5).clip(0, 1)
df_clean['ss_rolling7'] = df_clean.groupby('region_name')['ss'].transform(lambda x: x.rolling(7, min_periods=1).mean())
df_clean['rain_sun_ratio'] = df_clean['RR'] / (df_clean['ss'] + 0.1)

# --- Training ---
feature_cols = [c for c in df_clean.columns if c not in ['date','station_name','ddd_car','region_name','station_id','flood']]
X, y = df_clean[feature_cols], df_clean['flood']

X_train, y_train = X[df_clean['year'] < 2019], y[df_clean['year'] < 2019]
X_val, y_val     = X[df_clean['year'] == 2019], y[df_clean['year'] == 2019]
X_test, y_test   = X[df_clean['year'] == 2020], y[df_clean['year'] == 2020]

smote = SMOTE(sampling_strategy=0.5, random_state=42)
X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train_sm)
X_val_sc, X_test_sc = scaler.transform(X_val), scaler.transform(X_test)

print("🚀 Training Models...")
models = {
    'Random Forest': RandomForestClassifier(n_estimators=300, max_depth=15, random_state=42, n_jobs=-1),
    'XGBoost': XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.05, random_state=42, eval_metric='logloss')
}

results = {}
for name, model in models.items():
    model.fit(X_train_sc, y_train_sm)
    y_prob = model.predict_proba(X_val_sc)[:, 1]
    results[name] = {
        'model': model, 
        'roc_auc': roc_auc_score(y_val, y_prob),
        'confusion_matrix': confusion_matrix(y_test, (model.predict_proba(X_test_sc)[:, 1] >= 0.35).astype(int))
    }

best_model = results['Random Forest']['model']
OPTIMAL_THRESHOLD = 0.35

# --- GIS Logic ---
print("⏳ Fetching OSM River Data...")
tags = {'waterway': ['river', 'canal', 'stream']}
rivers_gdf = ox.features_from_place('Jakarta, Indonesia', tags=tags)
rivers_gdf = rivers_gdf[rivers_gdf.geometry.geom_type.isin(['LineString', 'MultiLineString'])].copy()
rivers_gdf = rivers_gdf[['geometry', 'name', 'waterway']].reset_index(drop=True)
rivers_gdf.to_file(os.path.join(OUTPUTS_DIR, 'jakarta_rivers.geojson'), driver='GeoJSON')

rivers_proj = rivers_gdf.to_crs(epsg=32748)
buffer_distance = 100 + (0.35 * 800)
flood_buffer_wgs = gpd.GeoDataFrame(geometry=[rivers_proj.geometry.buffer(buffer_distance).unary_union], crs='EPSG:32748').to_crs(epsg=4326)
rivers_wgs = rivers_proj.to_crs(epsg=4326)

# --- Post-process for Export ---
df_test2 = df_clean[df_clean['year'] == 2020].copy().reset_index(drop=True)
df_test2['prob_rf'] = results['Random Forest']['model'].predict_proba(X_test_sc)[:, 1]
df_test2['prob_xgb'] = results['XGBoost']['model'].predict_proba(X_test_sc)[:, 1]
df_test2['prob_ensemble'] = (df_test2['prob_rf'] + df_test2['prob_xgb']) / 2
df_test2['pred_rf'] = (df_test2['prob_rf'] >= OPTIMAL_THRESHOLD).astype(int)
df_test2['pred_xgb'] = (df_test2['prob_xgb'] >= OPTIMAL_THRESHOLD).astype(int)

def aggregate_region(df, prob_col, pred_col):
    return df.groupby('region_name').agg(
        avg_prob=(prob_col, 'mean'), max_prob=(prob_col, 'max'), flood_days=(pred_col, 'sum'),
        total_days=(pred_col, 'count'), latitude=('latitude', 'first'), longitude=('longitude', 'first')
    ).reset_index().assign(flood_rate=lambda x: (x['flood_days']/x['total_days']*100).round(1))

region_rf = aggregate_region(df_test2, 'prob_rf', 'pred_rf')
region_xgb = aggregate_region(df_test2, 'prob_xgb', 'pred_xgb')
region_ensemble = region_rf.copy()
region_ensemble['avg_prob'] = (region_rf['avg_prob'] + region_xgb['avg_prob']) / 2

# ============================================================
# EXPORT OUTPUTS — untuk FastAPI (jalankan sekali)
# ============================================================
import joblib, json

# Simpan model
joblib.dump(results['Random Forest']['model'], os.path.join(MODELS_DIR, 'rf_model.joblib'))
joblib.dump(results['XGBoost']['model'], os.path.join(MODELS_DIR, 'xgb_model.joblib'))
joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))
print("✅ Models saved")

# Simpan region JSON
region_rf.to_json(os.path.join(OUTPUTS_DIR, 'region_rf.json'), orient='records')
region_xgb.to_json(os.path.join(OUTPUTS_DIR, 'region_xgb.json'), orient='records')
region_ensemble.to_json(os.path.join(OUTPUTS_DIR, 'region_ensemble.json'), orient='records')
print("✅ Region JSONs saved")

# Simpan GeoJSON
rivers_wgs.to_file(os.path.join(OUTPUTS_DIR, 'rivers.geojson'), driver='GeoJSON')
flood_buffer_wgs.to_file(os.path.join(OUTPUTS_DIR, 'flood_buffer.geojson'), driver='GeoJSON')
print("✅ GeoJSONs saved")

# Simpan analytics
analytics = {
    "rf_roc_auc"               : float(results['Random Forest']['roc_auc']),
    "xgb_roc_auc"              : float(results['XGBoost']['roc_auc']),
    "optimal_threshold"        : float(OPTIMAL_THRESHOLD),
    "rf_confusion_matrix"      : results['Random Forest']['confusion_matrix'].tolist(),
    "xgb_confusion_matrix"     : results['XGBoost']['confusion_matrix'].tolist(),
    "rf_feature_importance"    : dict(zip(feature_cols, results['Random Forest']['model'].feature_importances_.tolist())),
    "xgb_feature_importance"   : dict(zip(feature_cols, results['XGBoost']['model'].feature_importances_.tolist())),
}
with open(os.path.join(OUTPUTS_DIR, 'analytics.json'), 'w') as f:
    json.dump(analytics, f, indent=2)
print("✅ Analytics saved")

df_test2[['date', 'region_name', 'latitude', 'longitude', 'flood', 'prob_rf', 'prob_xgb', 'prob_ensemble', 'pred_rf', 'pred_xgb']].to_csv(os.path.join(OUTPUTS_DIR, 'test_predictions.csv'), index=False)
print("✅ Test predictions saved")

print("\n🎉 Semua output berhasil disimpan ke data/outputs/ dan data/models/")