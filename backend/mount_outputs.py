import os
import sys
import json
import joblib
import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import mapping
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODELS_DIR = os.path.join(DATA_DIR, 'models')
OUTPUTS_DIR = os.path.join(DATA_DIR, 'outputs')

# Create directories if they don't exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)

# Path to files
SCRIPT_PATH = os.path.join(BASE_DIR, 'jakartagis.py')
CSV_PATH = os.path.join(DATA_DIR, 'JakartaFlood.csv')

def run_pipeline():
    print("🚀 Starting Jakarta Flood Risk Pipeline...")
    
    # Read the original script
    with open(SCRIPT_PATH, 'r', encoding='utf-8') as f:
        code_lines = f.readlines()

    # Pre-process code to work in local environment
    processed_lines = []
    skip_multiline = False
    
    for line in code_lines:
        stripped = line.strip()
        
        # 1. Skip shell commands (!pip)
        if stripped.startswith('!'):
            processed_lines.append(f"# {line}")
            continue
            
        # 2. Skip Google Colab specific mounts
        if 'google.colab' in line or 'drive.mount' in line:
            processed_lines.append(f"# {line}")
            continue

        # 3. Override CSV loading path
        if 'pd.read_csv(' in line and ('/content/drive' in line or 'JakartaFlood.csv' in line):
            processed_lines.append(f"df = pd.read_csv(DATA_PATH)\n")
            continue

        # 4. Handle Colab paths and multi-line calls (savefig, to_file, etc)
        # If line contains /content/drive/ and seems to be a save/export command
        if '/content/drive/' in line and any(x in line for x in ['.save(', '.to_file(', '.to_csv(', '.savefig(']):
            processed_lines.append(f"# {line}")
            # If the line ends with a comma or open paren, the next lines might be part of it
            if stripped.endswith(',') or stripped.endswith('('):
                skip_multiline = True
            continue

        if skip_multiline:
            processed_lines.append(f"# {line}")
            if stripped.endswith(')'):
                skip_multiline = False
            continue
            
        processed_lines.append(line)

    code = "".join(processed_lines)

    # Setup execution environment
    exec_globals = {
        'DATA_PATH': CSV_PATH,
        '__name__': '__main__',
    }

    # Execute the script
    try:
        exec(code, exec_globals)
        print("✅ Original script execution successful.")
    except Exception as e:
        print(f"❌ Error during script execution: {e}")
        import traceback
        traceback.print_exc()
        return

    # Extract results
    try:
        # Models and Scaler
        rf_model = exec_globals['results']['Random Forest']['model']
        xgb_model = exec_globals['results']['XGBoost']['model']
        scaler = exec_globals['scaler']
        
        # Hyperparameters and Metadata
        optimal_threshold = exec_globals['OPTIMAL_THRESHOLD']
        feature_cols = exec_globals['feature_cols']
        results = exec_globals['results']
        
        # Results DataFrames
        region_rf = exec_globals['region_rf']
        region_xgb = exec_globals['region_xgb']
        region_ensemble = exec_globals['region_ensemble']
        df_test2 = exec_globals['df_test2']
        
        # GIS Data
        rivers_wgs = exec_globals['rivers_wgs']
        flood_buffer_wgs = exec_globals['flood_buffer_wgs']
        buffer_distance = exec_globals['buffer_distance']

        print("📦 Saving models to data/models/...")
        joblib.dump(rf_model, os.path.join(MODELS_DIR, 'rf_model.joblib'))
        joblib.dump(xgb_model, os.path.join(MODELS_DIR, 'xgb_model.joblib'))
        joblib.dump(scaler, os.path.join(MODELS_DIR, 'scaler.joblib'))

        print("📊 Saving region stats to data/outputs/...")
        region_rf.to_json(os.path.join(OUTPUTS_DIR, 'region_rf.json'), orient='records')
        region_xgb.to_json(os.path.join(OUTPUTS_DIR, 'region_xgb.json'), orient='records')
        region_ensemble.to_json(os.path.join(OUTPUTS_DIR, 'region_ensemble.json'), orient='records')

        print("🗺️ Saving GIS GeoJSON to data/outputs/...")
        rivers_wgs.to_file(os.path.join(OUTPUTS_DIR, 'rivers.geojson'), driver='GeoJSON')
        flood_buffer_wgs.to_file(os.path.join(OUTPUTS_DIR, 'flood_buffer.geojson'), driver='GeoJSON')

        print("📈 Saving analytics summary to data/outputs/analytics.json...")
        analytics = {
            "rf_roc_auc": results['Random Forest']['roc_auc'],
            "xgb_roc_auc": results['XGBoost']['roc_auc'],
            "optimal_threshold": float(optimal_threshold),
            "rf_classification_report": results['Random Forest'].get('report', "Available in original script execution"),
            "xgb_classification_report": results['XGBoost'].get('report', "Available in original script execution"),
            "rf_confusion_matrix": results['Random Forest'].get('confusion_matrix', np.array([])).tolist() if hasattr(results['Random Forest'].get('confusion_matrix'), 'tolist') else [],
            "xgb_confusion_matrix": results['XGBoost'].get('confusion_matrix', np.array([])).tolist() if hasattr(results['XGBoost'].get('confusion_matrix'), 'tolist') else [],
            "rf_feature_importance": dict(zip(feature_cols, rf_model.feature_importances_.tolist())),
            "xgb_feature_importance": dict(zip(feature_cols, xgb_model.feature_importances_.tolist())),
            "buffer_distance": float(buffer_distance)
        }
        
        # If classification report is not in results, we can generate it here if needed
        # but the prompt asked for what's in 'results'.
        
        with open(os.path.join(OUTPUTS_DIR, 'analytics.json'), 'w') as f:
            json.dump(analytics, f, indent=2)

        print("📄 Saving test predictions to data/outputs/test_predictions.csv...")
        # Ensure we only save necessary columns
        pred_cols = [
            'date','region_name','latitude','longitude',
            'flood','prob_rf','prob_xgb','prob_ensemble',
            'pred_rf','pred_xgb'
        ]
        df_test2[pred_cols].to_csv(os.path.join(OUTPUTS_DIR, 'test_predictions.csv'), index=False)

        print("✨ All outputs mounted successfully!")
        
    except KeyError as e:
        print(f"❌ Missing expected variable in script: {e}")
    except Exception as e:
        print(f"❌ Error during saving: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_pipeline()
