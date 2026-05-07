import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ModelCompareChartProps {
  data: any[];
}

export default function ModelCompareChart({ data }: ModelCompareChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
        <Tooltip 
          cursor={{ fill: '#f8fafc' }}
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }} 
        />
        <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '11px', fontWeight: 700 }} />
        <Bar dataKey="RF" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={12} />
        <Bar dataKey="XGB" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={12} />
        <Bar dataKey="Ensemble" fill="#10b981" radius={[6, 6, 0, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}
