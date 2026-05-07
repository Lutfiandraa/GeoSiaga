'use client';

import React from 'react';
import useSWR from 'swr';
import { fetcher, endpoints } from '@/lib/api';
import { AnalyticsSummary, TimelinePoint } from '@/lib/types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Cpu, Activity, CheckCircle2, XCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: analytics } = useSWR<AnalyticsSummary>(endpoints.analytics, fetcher);
  const { data: timeline } = useSWR<TimelinePoint[]>(endpoints.timeline, fetcher);

  if (!analytics || !timeline) return <div className="p-8 animate-pulse text-slate-400 font-medium">Computing analytics...</div>;

  const rfFeatures = Object.entries(analytics.rf_feature_importance)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }));

  const xgbFeatures = Object.entries(analytics.xgb_feature_importance)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            ROC-AUC Score
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
              <p className="text-xs font-bold text-blue-600 uppercase mb-1">Random Forest</p>
              <p className="text-2xl font-black text-blue-900">{analytics.rf_roc_auc.toFixed(4)}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-center">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">XGBoost</p>
              <p className="text-2xl font-black text-indigo-900">{analytics.xgb_roc_auc.toFixed(4)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" />
            Timeline Flood Events (2020)
          </h3>
          <div className="flex-1 min-h-[150px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorFlood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="flood_days" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFlood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Feature Importance (Top 15 - RF)</h3>
          <div className="h-[400px] min-h-[400px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rfFeatures} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Confusion Matrix Grid (Test Data)</h3>
          <div className="grid grid-cols-2 gap-8 h-full">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-4">Random Forest</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {analytics.rf_confusion_matrix.flat().map((val, idx) => (
                  <div key={`rf-cm-${idx}`} className="aspect-square flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-sm font-bold text-slate-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-4">XGBoost</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {analytics.xgb_confusion_matrix.flat().map((val, idx) => (
                  <div key={`xgb-cm-${idx}`} className="aspect-square flex items-center justify-center bg-indigo-50 border border-indigo-100 rounded-lg">
                    <span className="text-sm font-bold text-indigo-700">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
