import React from 'react';
import { RegionRisk } from '@/lib/types';
import { MapPin, Droplets, Calendar, ShieldAlert } from 'lucide-react';

interface RiskSummaryTableProps {
  data: RegionRisk[];
}

const RiskSummaryTable: React.FC<RiskSummaryTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-100 animate-pulse">
         <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
         <div className="space-y-3">
           {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-200 rounded"></div>)}
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white/50 backdrop-blur-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Regional Risk Matrix</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Detailed statistical breakdown</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-wider">
          Total: {data.length} Regions
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Wilayah</div>
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2"><Droplets className="w-3 h-3" /> Avg Prob</div>
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">
                <div className="flex items-center justify-center gap-2"><Calendar className="w-3 h-3" /> Flood Days</div>
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">
                <div className="flex items-center justify-end gap-2"><ShieldAlert className="w-3 h-3" /> Risk Status</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((region) => {
              const riskLevel = region.risk_level ?? 'Unknown Risk';
              const isHigh = riskLevel.includes('High');
              const isMedium = riskLevel.includes('Medium');
              const avgProb = region.avg_prob ?? 0;
              const floodDays = region.flood_days ?? 0;
              const regionName = region.region_name ?? 'Unknown Region';
              const regionId = regionName.split(' ').pop()?.toUpperCase() ?? 'UNK';
              const riskLabel = riskLevel.split(' ')[1] ?? 'Unknown';
              
              return (
                <tr key={regionName} className="group hover:bg-blue-50/30 transition-all duration-300">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-700 group-hover:text-blue-700 transition-colors">{regionName}</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">ID: {regionId}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="inline-flex items-center justify-center px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 transition-all">
                      {(avgProb * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold text-slate-600">{floodDays} <span className="text-[10px] font-medium text-slate-400 uppercase ml-1">Days</span></span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      isHigh ? 'bg-red-500 text-white shadow-red-200' :
                      isMedium ? 'bg-amber-400 text-white shadow-amber-200' :
                      'bg-emerald-500 text-white shadow-emerald-200'
                    }`}>
                      {riskLabel} Risk
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskSummaryTable;
