"use client";
import type { Review } from "@/lib/types";

interface Props {
  reviews: Review[];
}

export default function StarDistribution({ reviews }: Props) {
  const total = reviews.length || 1;
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.score === star).length,
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Star Distribution</h2>
      <div className="flex flex-col gap-3">
        {counts.map(({ star, count }) => {
          const pct = Math.round((count / total) * 100);
          const color =
            star >= 4 ? "bg-green-500" : star === 3 ? "bg-yellow-500" : "bg-red-500";
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-yellow-400 w-6 text-sm font-medium">{star}★</span>
              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-slate-400 text-sm w-16 text-right">
                {count.toLocaleString()} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
