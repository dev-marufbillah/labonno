"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/lib/utils/format";

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-line text-[12.5px] text-ink-muted">
        No sales in this period yet.
      </div>
    );
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A9906B" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#A9906B" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4DACB" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#6E675C" }}
            tickLine={false}
            axisLine={{ stroke: "#E4DACB" }}
            tickFormatter={(value: string) => value.slice(5).replace("-", "/")}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#6E675C" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#1E1D1A",
              border: "none",
              borderRadius: 6,
              fontSize: 11,
              color: "#FAF6F0",
            }}
            formatter={(value: number, name) => (name === "revenue" ? [formatMoney(value), "Revenue"] : [value, "Orders"])}
            labelFormatter={(label: string) => label}
          />
          <Area type="monotone" dataKey="revenue" stroke="#A9906B" strokeWidth={1.6} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
