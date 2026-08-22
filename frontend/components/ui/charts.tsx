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

// Our custom palette mapping based on Tailwind CSS custom properties (assuming tailwind handles them)
// We use rough approximations if exact hexes aren't available, but we can use Tailwind theme colors via generic names
const COLORS = ["#2A2A2A", "#D3422E", "#5E7A5A", "#E4D5C7", "#9E9E9E"]; // Ink, Postal, Moss, Kraft, Gray

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
          stroke="#F4F1EA" // paper color
          strokeWidth={4}
          label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
          labelStyle={{ fontFamily: 'var(--font-kalam)', fontSize: '14px', fill: '#2A2A2A' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#F4F1EA', 
            border: '2px solid #E4D5C7', 
            borderRadius: '4px',
            fontFamily: 'var(--font-courier)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
          itemStyle={{ color: '#2A2A2A' }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
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
        <CartesianGrid strokeDasharray="3 3" stroke="#E4D5C7" vertical={false} />
        <XAxis 
          dataKey="date" 
          stroke="#2A2A2A" 
          tick={{ fontFamily: 'var(--font-courier)', fontSize: 12 }} 
          tickLine={false}
          axisLine={{ stroke: '#2A2A2A', strokeWidth: 2 }}
        />
        <YAxis 
          stroke="#2A2A2A" 
          tick={{ fontFamily: 'var(--font-courier)', fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#2A2A2A', strokeWidth: 2 }}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          cursor={{ fill: '#E4D5C7', opacity: 0.4 }}
          contentStyle={{ 
            backgroundColor: '#F4F1EA', 
            border: '2px dashed #2A2A2A', 
            fontFamily: 'var(--font-courier)',
            boxShadow: '2px 2px 0 rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Cost']}
        />
        <Bar 
          dataKey="cost" 
          fill="#2A2A2A" 
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.cost > entry.target ? '#D3422E' : '#2A2A2A'} // Red if over target
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
