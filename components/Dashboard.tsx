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
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  const analysis = analyzeReviews(data.reviews);
  const appNames: Record<string, string> = {};
  for (const [id, info] of Object.entries(data.apps)) {
    appNames[id] = info.name;
  }
  const issueNames = analysis.issueStats.map((s) => s.name);

  const scrapedAt = lastScraped
    ? new Date(lastScraped).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date(data.scrapedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

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
      // Merge into existing data so we keep all previous app reviews
      setData((prev) => {
        const merged = {
          scrapedAt: json.scrapedAt,
          apps: { ...prev.apps, ...json.apps },
          reviews: [
            ...prev.reviews.filter((r) => !json.reviews.some((nr: { id: string }) => nr.id === r.id)),
            ...json.reviews,
          ],
        };
        return merged;
      });
      setLastScraped(json.scrapedAt);
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
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">JustDial Merchant Reviews Analyzer</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {data.reviews.length.toLocaleString()} reviews ·{" "}
            {Object.keys(data.apps).length} app{Object.keys(data.apps).length !== 1 ? "s" : ""} ·{" "}
            Last updated {scrapedAt}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(data.apps).map(([id, info]) => (
              <span key={id} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full px-3 py-1">
                {info.name}{info.rating ? ` · ★${Number(info.rating).toFixed(1)}` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* URL Scrape Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-slate-400 text-xs mb-2">
            Paste any Google Play Store app URL or app ID to add its reviews to the dashboard
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
                  Scrape Reviews
                </>
              )}
            </button>
          </div>
          {status === "loading" && (
            <p className="text-blue-400 text-xs mt-2 animate-pulse">
              Fetching up to 1,000 reviews… this takes 15–30 seconds
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <StatsCards data={data} analysis={analysis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StarDistribution reviews={data.reviews} />
          <IssueChart issueStats={analysis.issueStats} />
        </div>

        <WordCloudViz reviews={analysis.taggedReviews} />
        <TopIssues issueStats={analysis.issueStats} appNames={appNames} />
        <ReviewTable reviews={analysis.taggedReviews} appNames={appNames} issueNames={issueNames} />
      </div>

      <footer className="border-t border-slate-800 mt-8 py-6">
        <p className="text-center text-slate-600 text-xs">
          Data sourced from Google Play Store · For internal analysis only
        </p>
      </footer>
    </main>
  );
}
