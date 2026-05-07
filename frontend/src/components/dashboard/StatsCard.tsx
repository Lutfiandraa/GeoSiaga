import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'amber' | 'red' | 'emerald' | 'indigo';
  trend?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => {
  return (
    <div className="glass-card p-6 group">
      <div className="flex items-start justify-between mb-6">
        <div className={cn(
          "p-4 rounded-2xl border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
          colorMap[color]
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="text-[10px] font-black uppercase tracking-wider">{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <span className="text-[10px] font-bold text-slate-400">{subtitle}</span>}
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">View Details</span>
         <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
      </div>
    </div>
  );
};

export default StatsCard;
