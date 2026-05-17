"use client";

import * as React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const MOCK_DATA = [
  { name: "Mon", revenue: 4000, orders: 24 },
  { name: "Tue", revenue: 3000, orders: 18 },
  { name: "Wed", revenue: 5000, orders: 35 },
  { name: "Thu", revenue: 2780, orders: 15 },
  { name: "Fri", revenue: 6890, orders: 48 },
  { name: "Sat", revenue: 8390, orders: 60 },
  { name: "Sun", revenue: 7490, orders: 55 },
];

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={MOCK_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#6B7280', fontSize: 12}} 
          dy={10} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#6B7280', fontSize: 12}}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`$${value}`, 'Revenue']}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#2563EB" 
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 6, fill: "#2563EB", stroke: "#FFF", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
