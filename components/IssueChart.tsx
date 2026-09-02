"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { IssueStats } from "@/lib/types";

interface Props {
  issueStats: IssueStats[];
}

const COLORS = [
  "#3b82f6","#6366f1","#8b5cf6","#a855f7","#ec4899","#ef4444","#f97316","#eab308",
];

export default function IssueChart({ issueStats }: Props) {
  const data = issueStats.map((s) => ({ name: s.name.split(" / ")[0], fullName: s.name, count: s.count, pct: s.pct }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Issue Breakdown (Negative Reviews)</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
          <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fill: "#cbd5e1", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 }}
            labelStyle={{ color: "#f1f5f9" }}
            formatter={(value: number, _name: string, props) => [
              `${value} reviews (${props.payload.pct}%)`,
              props.payload.fullName,
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} label={{ position: "right", fill: "#64748b", fontSize: 11, formatter: (v: number) => v }}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
