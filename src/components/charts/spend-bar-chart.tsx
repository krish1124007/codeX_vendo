"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export function SpendBarChart({
  data,
  highlightLast = true,
}: {
  data: { month: string; spend: number }[];
  highlightLast?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            color: "#0a0a0a",
            fontSize: 12,
          }}
          formatter={(value) => [`₹${(Number(value) / 100000).toFixed(1)}L`, "Spend"]}
        />
        <Bar dataKey="spend" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={highlightLast && i === data.length - 1 ? "#111827" : "#d4d4d8"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
