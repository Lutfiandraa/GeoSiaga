export interface RegionRisk {
  region_name: string;
  avg_prob: number;
  max_prob: number;
  flood_days: number;
  flood_rate: number;
  risk_level: string;
  latitude: number;
  longitude: number;
}

export interface ModelCompare {
  region_name: string;
  rf: RegionRisk;
  xgb: RegionRisk;
  ensemble: RegionRisk;
}

export interface AnalyticsSummary {
  rf_roc_auc: number;
  xgb_roc_auc: number;
  optimal_threshold: number;
  rf_feature_importance: Record<string, number>;
  xgb_feature_importance: Record<string, number>;
  rf_confusion_matrix: number[][];
  xgb_confusion_matrix: number[][];
  buffer_distance: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  prob: number;
}

export interface PredictResponse {
  rf_prob: number;
  xgb_prob: number;
  ensemble_prob: number;
  risk_level: string;
  threshold: number;
}

export interface TimelinePoint {
  month: string;
  flood_days: number;
  avg_prob: number;
}

export interface ActualEvent {
  date: string;
  region_name: string;
  latitude: number;
  longitude: number;
}
