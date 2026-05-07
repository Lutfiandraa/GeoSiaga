'use client';

import React from 'react';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { fetcher, endpoints } from '@/lib/api';
import { RegionRisk, AnalyticsSummary } from '@/lib/types';
import StatsCard from '@/components/dashboard/StatsCard';
import RiskSummaryTable from '@/components/dashboard/RiskSummaryTable';
import { 
  Users, 
  Droplets, 
  AlertTriangle, 
  Zap,
  BarChart3,
  Calendar,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const ModelCompareChart = dynamic(
  () => import('@/components/dashboard/ModelCompareChart'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg"></div> }
);

const FloodDaysChart = dynamic(
  () => import('@/components/dashboard/FloodDaysChart'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg"></div> }
);

export default function DashboardPage() {
  const { data: regions, error: regionsError, isLoading: isRegionsLoading } = useSWR<RegionRisk[]>(endpoints.regions, fetcher);
  const { data: analytics, error: analyticsError, isLoading: isAnalyticsLoading } = useSWR<AnalyticsSummary>(endpoints.analytics, fetcher);
  const { data: compareData } = useSWR<any[]>(endpoints.compare, fetcher);

  const isLoading = isRegionsLoading || isAnalyticsLoading || !regions || !analytics;

  if (regionsError || analyticsError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-bold">Gagal memuat data dashboard. Pastikan backend sudah berjalan.</p>
        </div>
        <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2">
          Coba Lagi <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="h-80 bg-slate-200 rounded-3xl"></div>
          <div className="h-80 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const totalRegions = regions.length;
  const avgProb = regions.reduce((acc, curr) => acc + (curr.avg_prob || 0), 0) / (totalRegions || 1);
  const totalFloodDays = regions.reduce((acc, curr) => acc + (curr.flood_days || 0), 0);
  const bestModel = analytics.rf_roc_auc > analytics.xgb_roc_auc ? 'Random Forest' : 'XGBoost';

  const compareChartData = compareData?.slice(0, 8).map(item => ({
    name: item.region_name?.replace('Jakarta ', '') || 'Unknown',
    RF: parseFloat(((item.rf?.avg_prob || 0) * 100).toFixed(1)),
    XGB: parseFloat(((item.xgb?.avg_prob || 0) * 100).toFixed(1)),
    Ensemble: parseFloat(((item.ensemble?.avg_prob || 0) * 100).toFixed(1)),
  })) || [];

  const floodDaysData = regions.slice(0, 10).sort((a, b) => (b.flood_days || 0) - (a.flood_days || 0)).map(r => ({
    name: r.region_name?.replace('Jakarta ', '') || 'Unknown',
    days: r.flood_days || 0,
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time analysis of Jakarta flood risks using Ensemble ML models.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Period: 2020 (Test Set)</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Wilayah" value={totalRegions} icon={Users} color="blue" trend="+2.4%" />
        <StatsCard title="Avg Probabilitas" value={`${(avgProb * 100).toFixed(1)}%`} icon={Droplets} color="amber" />
        <StatsCard title="Total Hari Banjir" value={totalFloodDays} icon={TrendingUp} color="red" trend="Seasonal" />
        <StatsCard title="Akurasi Model" value={bestModel} subtitle={`AUC: ${Math.max(analytics.rf_roc_auc, analytics.xgb_roc_auc).toFixed(4)}`} icon={Zap} color="emerald" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              Model Performance Comparison
            </h3>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-500"></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Prob %</span>
            </div>
          </div>
          <div className="h-[320px] w-full relative">
            <ModelCompareChart data={compareChartData} />
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              Flood Days Distribution
            </h3>
          </div>
          <div className="h-[320px] w-full relative">
            <FloodDaysChart data={floodDaysData} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass-card overflow-hidden">
        <RiskSummaryTable data={regions} />
      </div>
    </div>
  );
}
