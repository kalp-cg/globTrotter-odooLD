"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#2E2A25", "#B33A2E", "#5F7048", "#D9C4A0", "#4C6B87", "#DFA13B"];

interface CategoryChartProps {
  data: { name: string; value: number }[];
}

export function CategoryPieChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          stroke="#F4EDDD" // paper color
          strokeWidth={4}
          label={({ name, percent }) => (percent !== undefined && percent > 0.05) ? `${name}` : ''}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#F4EDDD', 
            border: '2px solid #D9C4A0', 
            borderRadius: '2px',
            fontFamily: 'var(--font-mono)',
            boxShadow: '2px 2px 0px #2E2A25'
          }}
          itemStyle={{ color: '#2E2A25' }}
          formatter={(value: any) => [`$${Number(value || 0).toFixed(0)}`, 'Cost']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface DailyBarChartProps {
  data: { date: string; cost: number; target: number }[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#D9C4A0" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#2E2A25" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: '#2E2A25', strokeWidth: 2 }}
        />
        <YAxis 
          stroke="#2E2A25" 
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#2E2A25', strokeWidth: 2 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: '#D9C4A0', opacity: 0.4 }}
          contentStyle={{ 
            backgroundColor: '#F4EDDD', 
            border: '2px dashed #2E2A25', 
            fontFamily: 'var(--font-mono)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
          }}
          formatter={(value: any) => [`$${Number(value || 0).toFixed(0)}`, 'Total Cost']}
        />
        <Bar 
          dataKey="cost" 
          fill="#2E2A25" 
          radius={[2, 2, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.cost > entry.target ? '#B33A2E' : '#2E2A25'} // Red if over target
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
