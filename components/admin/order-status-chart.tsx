"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const COLORS = ["#A9906B", "#6E675C", "#1F5C56", "#8A5A3B", "#2F6B4F", "#A33B3B", "#3A362F"];

export function OrderStatusChart({ data }: { data: { status: string; count: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-[180px] items-center justify-center text-[12px] text-ink-muted">No orders yet.</div>;
  }
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis dataKey="status" tick={{ fontSize: 9.5, fill: "#6E675C" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#1E1D1A", border: "none", borderRadius: 6, fontSize: 11, color: "#FAF6F0" }}
            formatter={(value: number) => [value, "Orders"]}
          />
          <Bar dataKey="count" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
