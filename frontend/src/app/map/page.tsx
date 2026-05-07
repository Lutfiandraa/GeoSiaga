'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher, endpoints } from '@/lib/api';
import { RegionRisk, HeatmapPoint, ActualEvent } from '@/lib/types';
import { Map as MapIcon, Layers, Info, Filter } from 'lucide-react';

const FloodMap = dynamic(() => import('@/components/map/FloodMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">Initializing Map Engine...</div>
});

export default function MapPage() {
  const { data: regions } = useSWR<RegionRisk[]>(endpoints.regions, fetcher);
  const { data: rivers } = useSWR(endpoints.rivers, fetcher);
  const { data: buffer } = useSWR(endpoints.buffer, fetcher);
  const { data: actualEvents } = useSWR<ActualEvent[]>(endpoints.actualEvents, fetcher);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-full">
          {regions && (
            <FloodMap 
              regions={regions} 
              rivers={rivers} 
              buffer={buffer}
              actualEvents={actualEvents}
            />
          )}
        </div>
        
        <div className="space-y-6 overflow-y-auto pr-2">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Map Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200" />
                <span className="text-xs font-bold text-slate-700">High Risk (≥ 60%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
                <span className="text-xs font-bold text-slate-700">Medium Risk (30-60%)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                <span className="text-xs font-bold text-slate-700">Low Risk (&lt; 30%)</span>
              </div>
              <hr className="border-slate-50" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-1 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-slate-700">Sungai / Kanal</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-3 rounded-sm bg-blue-200/40 border border-blue-400 border-dashed" />
                <span className="text-xs font-bold text-slate-700">Buffer Zone</span>
              </div>
            </div>
          </div>

          <div className="bg-black p-5 rounded-2xl text-white shadow-xl">
             <div className="h-32 bg-zinc-900 rounded-xl mb-4 border border-white/5 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
               MiniMap Component
             </div>
             <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Observation</p>
             <p className="text-xs text-slate-300 italic">
               Spatial layers indicate risk alignment with low-elevation urban corridors.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
