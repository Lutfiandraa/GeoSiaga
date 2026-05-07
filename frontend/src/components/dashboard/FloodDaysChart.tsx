import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FloodDaysChartProps {
  data: any[];
}

export default function FloodDaysChart({ data }: FloodDaysChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg"></div>;
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
        <Tooltip 
          cursor={{ fill: '#fff1f2' }}
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
        />
        <Bar dataKey="days" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
