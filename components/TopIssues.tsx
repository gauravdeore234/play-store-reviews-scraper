"use client";
import { useState } from "react";
import type { IssueStats } from "@/lib/types";

interface Props {
  issueStats: IssueStats[];
  appNames: Record<string, string>;
}

const BADGE_COLORS = [
  "bg-blue-900 text-blue-300",
  "bg-indigo-900 text-indigo-300",
  "bg-violet-900 text-violet-300",
  "bg-purple-900 text-purple-300",
  "bg-pink-900 text-pink-300",
  "bg-red-900 text-red-300",
  "bg-orange-900 text-orange-300",
  "bg-yellow-900 text-yellow-300",
];

export default function TopIssues({ issueStats, appNames }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Top Issues Deep Dive</h2>
      <div className="flex flex-col gap-2">
        {issueStats.map((issue, idx) => (
          <div key={issue.name} className="border border-slate-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === issue.name ? null : issue.name)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLORS[idx % BADGE_COLORS.length]}`}>
                  #{idx + 1}
                </span>
                <span className="text-white font-medium">{issue.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">{issue.count} reviews · {issue.pct}%</span>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform ${open === issue.name ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {open === issue.name && (
              <div className="px-4 pb-4 bg-slate-950">
                <p className="text-slate-400 text-sm mb-3 pt-3">
                  Example reviews mentioning this issue:
                </p>
                <div className="flex flex-col gap-3">
                  {issue.examples.slice(0, 5).map((r) => (
                    <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 text-xs">{"★".repeat(r.score)}{"☆".repeat(5 - r.score)}</span>
                        <span className="text-slate-500 text-xs">{appNames[r.app] || r.app}</span>
                        {r.date && (
                          <span className="text-slate-600 text-xs">{new Date(r.date).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        &ldquo;{r.content.slice(0, 300)}{r.content.length > 300 ? "…" : ""}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
