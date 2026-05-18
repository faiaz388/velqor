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
  { name: "Mon", revenue: 0, orders: 0 },
  { name: "Tue", revenue: 0, orders: 0 },
  { name: "Wed", revenue: 0, orders: 0 },
  { name: "Thu", revenue: 0, orders: 0 },
  { name: "Fri", revenue: 0, orders: 0 },
  { name: "Sat", revenue: 0, orders: 0 },
  { name: "Sun", revenue: 0, orders: 0 },
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
          tickFormatter={(value) => `৳${value}`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`৳${value}`, 'Revenue']}
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
