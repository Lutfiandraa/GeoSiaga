'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, Activity, Play } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PredictionResponse {
  rf_prob: number;
  xgb_prob: number;
  ensemble_prob: number;
  risk_level: string;
  threshold: number;
}

export default function PredictPage() {
  const [formData, setFormData] = useState({
    Tn: '',
    Tx: '',
    Tavg: '',
    RH_avg: '',
    RR: '',
    ss: '',
    ff_x: '',
    ddd_x: '',
    ff_avg: '',
    region_name: 'Jakarta Selatan'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Convert string values to numbers
    const payload = {
      Tn: parseFloat(formData.Tn) || 0,
      Tx: parseFloat(formData.Tx) || 0,
      Tavg: parseFloat(formData.Tavg) || 0,
      RH_avg: parseFloat(formData.RH_avg) || 0,
      RR: parseFloat(formData.RR) || 0,
      ss: parseFloat(formData.ss) || 0,
      ff_x: parseFloat(formData.ff_x) || 0,
      ddd_x: parseFloat(formData.ddd_x) || 0,
      ff_avg: parseFloat(formData.ff_avg) || 0,
      region_name: formData.region_name
    };

    try {
      const response = await axios.post('http://localhost:8000/api/predict', payload);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred while fetching prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Flood Risk Prediction</h1>
          <p className="text-slate-500 font-medium mt-1">Input weather features to calculate ensemble model probability.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Region Name</label>
                <select 
                  name="region_name" 
                  value={formData.region_name} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="Jakarta Selatan">Jakarta Selatan</option>
                  <option value="Jakarta Utara">Jakarta Utara</option>
                  <option value="Jakarta Pusat">Jakarta Pusat</option>
                  <option value="Jakarta Timur">Jakarta Timur</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tn (Min Temp °C)</label>
                <input required type="number" step="any" name="Tn" value={formData.Tn} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tx (Max Temp °C)</label>
                <input required type="number" step="any" name="Tx" value={formData.Tx} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tavg (Avg Temp °C)</label>
                <input required type="number" step="any" name="Tavg" value={formData.Tavg} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">RH_avg (Humidity %)</label>
                <input required type="number" step="any" name="RH_avg" value={formData.RH_avg} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">RR (Rainfall mm)</label>
                <input required type="number" step="any" name="RR" value={formData.RR} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ss (Sunshine Hours)</label>
                <input required type="number" step="any" name="ss" value={formData.ss} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ff_x (Max Wind Speed)</label>
                <input required type="number" step="any" name="ff_x" value={formData.ff_x} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ddd_x (Wind Direction °)</label>
                <input required type="number" step="any" name="ddd_x" value={formData.ddd_x} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ff_avg (Avg Wind Speed)</label>
                <input required type="number" step="any" name="ff_avg" value={formData.ff_avg} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className={cn(
                  "px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg",
                  isLoading ? "bg-slate-200 text-slate-500" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                )}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Predict Flood Risk
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Prediction Results
            </h3>
            
            {!result && !error && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                  <Play className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium">Submit the form to see prediction results.</p>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            )}

            {error && (
              <div className="flex-1 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex flex-col gap-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-5 h-5" />
                  Error
                </div>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {result && (
              <div className="flex-1 flex flex-col space-y-6 animate-in fade-in">
                <div className="p-5 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all shadow-sm"
                  style={{
                    backgroundColor: result.risk_level === 'High Risk' ? '#fef2f2' : '#f0fdf4',
                    borderColor: result.risk_level === 'High Risk' ? '#fecaca' : '#bbf7d0'
                  }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Risk Level</p>
                  <p className={cn(
                    "text-3xl font-black",
                    result.risk_level === 'High Risk' ? "text-red-600" : "text-emerald-600"
                  )}>
                    {result.risk_level}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">Ensemble Prob</span>
                    <span className="text-base font-black text-slate-800">{(result.ensemble_prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">RF Prob</span>
                    <span className="text-sm font-bold text-slate-700">{(result.rf_prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase">XGB Prob</span>
                    <span className="text-sm font-bold text-slate-700">{(result.xgb_prob * 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Threshold</span>
                    <span className="text-xs font-medium text-slate-500">{result.threshold}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
