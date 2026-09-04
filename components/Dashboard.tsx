"use client";
import { useState } from "react";
import type { ReviewsData } from "@/lib/types";
import { analyzeReviews } from "@/lib/analyzeReviews";
import StatsCards from "./StatsCards";
import StarDistribution from "./StarDistribution";
import IssueChart from "./IssueChart";
import WordCloudViz from "./WordCloudViz";
import TopIssues from "./TopIssues";
import ReviewTable from "./ReviewTable";

interface Props {
  initialData: ReviewsData;
}

type ScrapeStatus = "idle" | "loading" | "error";

export default function Dashboard({ initialData }: Props) {
  const [data, setData] = useState<ReviewsData>(initialData);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<ScrapeStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const hasData = data.reviews.length > 0;
  const analysis = analyzeReviews(data.reviews);
  const appNames: Record<string, string> = {};
  for (const [id, info] of Object.entries(data.apps)) {
    appNames[id] = info.name || id;
  }
  const issueNames = analysis.issueStats.map((s) => s.name);

  async function handleScrape() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed, count: 500 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Scrape failed");
        setStatus("error");
        return;
      }
      setData((prev) => ({
        scrapedAt: json.scrapedAt,
        apps: { ...prev.apps, ...json.apps },
        reviews: [
          ...prev.reviews.filter((r) => !json.reviews.some((nr: { id: string }) => nr.id === r.id)),
          ...json.reviews,
        ],
      }));
      setStatus("idle");
      setUrl("");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Network error");
      setStatus("error");
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleScrape();
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h1 className="text-xl font-bold text-white">Play Store Reviews Scraper</h1>
          </div>
          {hasData && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-slate-400 text-sm">
                {data.reviews.length.toLocaleString()} reviews · {Object.keys(data.apps).length} app{Object.keys(data.apps).length !== 1 ? "s" : ""}
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.apps).map(([id, info]) => (
                  <span key={id} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full px-3 py-1">
                    {info.name || id}{info.rating ? ` · ★${Number(info.rating).toFixed(1)}` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* URL Input Bar */}
      <div className={`border-b border-slate-800 ${hasData ? "bg-slate-900/40" : "bg-slate-900"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!hasData && (
            <p className="text-slate-300 text-sm font-medium mb-1">
              Paste a Google Play Store app URL to analyze its reviews
            </p>
          )}
          <p className="text-slate-500 text-xs mb-2">
            {hasData
              ? "Add another app — its reviews will be merged into the dashboard"
              : "Supports any public app · scrapes up to 1,000 reviews"}
          </p>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setStatus("idle"); setErrorMsg(""); }}
              onKeyDown={handleKey}
              placeholder="https://play.google.com/store/apps/details?id=com.example.app"
              disabled={status === "loading"}
              className="flex-1 min-w-0 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-4 py-2.5 text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={handleScrape}
              disabled={status === "loading" || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Scraping…
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Analyze Reviews
                </>
              )}
            </button>
          </div>
          {status === "loading" && (
            <p className="text-blue-400 text-xs mt-2 animate-pulse">
              Fetching up to 1,000 reviews — this takes 15–30 seconds…
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h2 className="text-slate-300 text-lg font-semibold mb-2">No app analyzed yet</h2>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            Paste a Google Play Store URL above and click <span className="text-slate-300">Analyze Reviews</span> to see star distribution, issue breakdown, word cloud, and a full review browser.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full">
            {[
              { label: "Star Distribution", desc: "See how ratings are spread" },
              { label: "Issue Breakdown", desc: "8 merchant pain point categories" },
              { label: "Review Browser", desc: "Filter, sort, and search all reviews" },
            ].map((f) => (
              <div key={f.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-slate-300 text-sm font-medium">{f.label}</p>
                <p className="text-slate-500 text-xs mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard — only shown once data is loaded */}
      {hasData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 w-full">
          <StatsCards data={data} analysis={analysis} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StarDistribution reviews={data.reviews} />
            <IssueChart issueStats={analysis.issueStats} />
          </div>
          <WordCloudViz reviews={analysis.taggedReviews} />
          <TopIssues issueStats={analysis.issueStats} appNames={appNames} />
          <ReviewTable reviews={analysis.taggedReviews} appNames={appNames} issueNames={issueNames} />
        </div>
      )}

      <footer className="border-t border-slate-800 py-5 mt-auto">
        <p className="text-center text-slate-600 text-xs">
          Data sourced from Google Play Store · For internal analysis only
        </p>
      </footer>
    </main>
  );
}
