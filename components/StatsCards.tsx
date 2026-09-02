"use client";
import type { ReviewsData, AnalysisResult } from "@/lib/types";

interface Props {
  data: ReviewsData;
  analysis: AnalysisResult;
}

function Card({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-bold ${accent ?? "text-white"}`}>{value}</span>
      {sub && <span className="text-sm text-slate-400">{sub}</span>}
    </div>
  );
}

export default function StatsCards({ data, analysis }: Props) {
  const total = data.reviews.length;
  const avg = analysis.avgRating.toFixed(2);
  const negPct = total > 0 ? Math.round((analysis.negativeCount / total) * 100) : 0;
  const top = analysis.issueStats[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card label="Total Reviews" value={total.toLocaleString()} sub="across all apps" />
      <Card
        label="Avg Rating"
        value={`★ ${avg}`}
        sub="out of 5"
        accent="text-yellow-400"
      />
      <Card
        label="Negative (1–3★)"
        value={`${analysis.negativeCount.toLocaleString()}`}
        sub={`${negPct}% of total`}
        accent="text-red-400"
      />
      <Card
        label="#1 Issue"
        value={top ? top.name : "—"}
        sub={top ? `${top.pct}% of negative reviews` : ""}
        accent="text-blue-400"
      />
    </div>
  );
}
