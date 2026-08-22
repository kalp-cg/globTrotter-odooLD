"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminCharts({ trends }: { trends: any }) {
  if (!trends || !trends.time_series || trends.time_series.length === 0) {
    return <div className="w-full h-[300px] flex items-center justify-center font-body text-ink/40">No trend data available.</div>;
  }

  // Map data correctly
  const data = trends.time_series.map((t: any) => ({
    date: new Date(t.creation_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    trips: Number(t.daily_trips)
  }));

  return (
    <div className="w-full h-[300px]" style={{ fontFamily: 'var(--font-mono)' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D3422E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#D3422E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={{ stroke: '#2A2A2A', strokeDasharray: '3 3', opacity: 0.3 }} 
            tickLine={false} 
            tick={{ fill: '#2A2A2A', fontSize: 12, opacity: 0.7 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#2A2A2A', fontSize: 12, opacity: 0.7 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#F4F1EA', 
              border: '2px solid #D9CDBF', 
              borderRadius: '2px',
              fontFamily: 'var(--font-display)',
              color: '#2A2A2A'
            }} 
            itemStyle={{ color: '#D3422E' }}
          />
          <Area 
            type="monotone" 
            dataKey="trips" 
            stroke="#D3422E" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorTrips)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
