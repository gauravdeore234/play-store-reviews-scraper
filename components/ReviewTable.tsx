"use client";
import { useState, useMemo } from "react";
import type { Review } from "@/lib/types";

interface Props {
  reviews: Review[];
  appNames: Record<string, string>;
  issueNames: string[];
}

const PAGE_SIZE = 20;

const ISSUE_COLORS = [
  "bg-blue-900 text-blue-300 border-blue-800",
  "bg-indigo-900 text-indigo-300 border-indigo-800",
  "bg-violet-900 text-violet-300 border-violet-800",
  "bg-purple-900 text-purple-300 border-purple-800",
  "bg-pink-900 text-pink-300 border-pink-800",
  "bg-red-900 text-red-300 border-red-800",
  "bg-orange-900 text-orange-300 border-orange-800",
  "bg-yellow-900 text-yellow-300 border-yellow-800",
];

function IssuePill({ name, allIssues }: { name: string; allIssues: string[] }) {
  const idx = allIssues.indexOf(name);
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${ISSUE_COLORS[idx % ISSUE_COLORS.length]}`}>
      {name.split(" / ")[0]}
    </span>
  );
}

export default function ReviewTable({ reviews, appNames, issueNames }: Props) {
  const [search, setSearch] = useState("");
  const [filterStar, setFilterStar] = useState("all");
  const [filterApp, setFilterApp] = useState("all");
  const [filterIssue, setFilterIssue] = useState("all");
  const [sortKey, setSortKey] = useState<"date" | "score" | "thumbsUp">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const appIds = Object.keys(appNames);

  const filtered = useMemo(() => {
    let result = reviews;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.content.toLowerCase().includes(q));
    }
    if (filterStar !== "all") result = result.filter((r) => r.score === parseInt(filterStar));
    if (filterApp !== "all") result = result.filter((r) => r.app === filterApp);
    if (filterIssue !== "all") result = result.filter((r) => r.issues?.includes(filterIssue));
    result = [...result].sort((a, b) => {
      let av: number, bv: number;
      if (sortKey === "date") {
        av = a.date ? new Date(a.date).getTime() : 0;
        bv = b.date ? new Date(b.date).getTime() : 0;
      } else if (sortKey === "score") {
        av = a.score; bv = b.score;
      } else {
        av = a.thumbsUp; bv = b.thumbsUp;
      }
      return sortDir === "desc" ? bv - av : av - bv;
    });
    return result;
  }, [reviews, search, filterStar, filterApp, filterIssue, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
    setPage(0);
  }

  function SortBtn({ label, k }: { label: string; k: typeof sortKey }) {
    return (
      <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-white">
        {label}
        {sortKey === k ? (sortDir === "desc" ? " ↓" : " ↑") : ""}
      </button>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Review Browser</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search reviews…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-40 placeholder-slate-500 focus:outline-none focus:border-blue-600"
        />
        <select
          value={filterStar}
          onChange={(e) => { setFilterStar(e.target.value); setPage(0); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Stars</option>
          {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s}★</option>)}
        </select>
        <select
          value={filterApp}
          onChange={(e) => { setFilterApp(e.target.value); setPage(0); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Apps</option>
          {appIds.map((id) => <option key={id} value={id}>{appNames[id]}</option>)}
        </select>
        <select
          value={filterIssue}
          onChange={(e) => { setFilterIssue(e.target.value); setPage(0); }}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="all">All Issues</option>
          {issueNames.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <p className="text-slate-500 text-sm mb-3">{filtered.length.toLocaleString()} reviews</p>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-3 py-3 text-left w-14">
                <SortBtn label="Score" k="score" />
              </th>
              <th className="px-3 py-3 text-left">
                <SortBtn label="Date" k="date" />
              </th>
              <th className="px-3 py-3 text-left hidden md:table-cell">App</th>
              <th className="px-3 py-3 text-left">Review</th>
              <th className="px-3 py-3 text-left hidden lg:table-cell">Issues</th>
              <th className="px-3 py-3 text-right">
                <SortBtn label="👍" k="thumbsUp" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((r) => (
              <tr
                key={r.id}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="border-t border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="px-3 py-3">
                  <span className={r.score <= 2 ? "text-red-400" : r.score === 3 ? "text-yellow-400" : "text-green-400"}>
                    {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-400 whitespace-nowrap">
                  {r.date ? new Date(r.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                </td>
                <td className="px-3 py-3 text-slate-400 hidden md:table-cell text-xs max-w-24 truncate">
                  {appNames[r.app] || r.app}
                </td>
                <td className="px-3 py-3 text-slate-300">
                  {expanded === r.id
                    ? r.content
                    : r.content.slice(0, 160) + (r.content.length > 160 ? "…" : "")}
                </td>
                <td className="px-3 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {(r.issues || []).map((iss) => (
                      <IssuePill key={iss} name={iss} allIssues={issueNames} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-500 text-right">{r.thumbsUp || ""}</td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-slate-500">No reviews match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700"
          >
            ← Prev
          </button>
          <span className="text-slate-400 text-sm">
            Page {page + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page === pageCount - 1}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm disabled:opacity-40 hover:bg-slate-700"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
