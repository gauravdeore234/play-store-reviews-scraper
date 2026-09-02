import { readFileSync } from "fs";
import path from "path";
import { analyzeReviews } from "@/lib/analyzeReviews";
import type { ReviewsData } from "@/lib/types";
import StatsCards from "@/components/StatsCards";
import StarDistribution from "@/components/StarDistribution";
import IssueChart from "@/components/IssueChart";
import WordCloudViz from "@/components/WordCloudViz";
import TopIssues from "@/components/TopIssues";
import ReviewTable from "@/components/ReviewTable";

function loadData(): ReviewsData {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "reviews.json");
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as ReviewsData;
  } catch {
    return {
      scrapedAt: new Date().toISOString(),
      apps: {
        "com.justdial.search": { name: "JD - Search, Shop, Travel, B2B", rating: 4.2, totalReviews: 1010000, installs: "10M+" },
        "com.jdseller.android": { name: "JD Business (Seller App)", rating: 3.1, totalReviews: 45000, installs: "1M+" },
        "com.justdial.jdmart": { name: "JD Mart (B2B)", rating: 3.4, totalReviews: 22000, installs: "500K+" },
      },
      reviews: DEMO_REVIEWS,
    };
  }
}

export default function Home() {
  const data = loadData();
  const analysis = analyzeReviews(data.reviews);

  const appNames: Record<string, string> = {};
  for (const [id, info] of Object.entries(data.apps)) {
    appNames[id] = info.name;
  }

  const issueNames = analysis.issueStats.map((s) => s.name);
  const scrapedAt = new Date(data.scrapedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-white">JustDial Merchant Reviews Analyzer</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {data.reviews.length.toLocaleString()} reviews scraped ·{" "}
            {Object.keys(data.apps).length} apps ·{" "}
            Last updated {scrapedAt}
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(data.apps).map(([id, info]) => (
              <span key={id} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-full px-3 py-1">
                {info.name}{info.rating ? ` · ★${info.rating}` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

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

const DEMO_REVIEWS = [
  { id: "1", app: "com.jdseller.android", score: 1, date: "2025-10-01T00:00:00Z", content: "Complete fraud and scam. They gave me fake leads, all calls were from marketing companies not real customers. Waste of money, do not buy their packages.", thumbsUp: 45, appVersion: "2.1.0", issues: [] },
  { id: "2", app: "com.jdseller.android", score: 1, date: "2025-09-15T00:00:00Z", content: "Their sales team keeps calling and harassing me every day. I asked them to cancel my subscription and stop the ECS deduction but they won't cancel. Worst customer service ever.", thumbsUp: 38, appVersion: "2.0.9", issues: [] },
  { id: "3", app: "com.jdseller.android", score: 2, date: "2025-09-20T00:00:00Z", content: "Overpriced package. Got irrelevant leads — job seekers calling me not actual customers. Refund request was ignored. Not worth the money at all.", thumbsUp: 29, appVersion: "2.1.1", issues: [] },
  { id: "4", app: "com.jdseller.android", score: 1, date: "2025-10-10T00:00:00Z", content: "App crashes every time I try to view my leads. Huge bug in the notification system. Slow to load and hangs for minutes.", thumbsUp: 22, appVersion: "2.0.8", issues: [] },
  { id: "5", app: "com.justdial.search", score: 5, date: "2025-10-05T00:00:00Z", content: "Very useful app. Found great local service providers quickly. The search feature works well and the ratings are helpful.", thumbsUp: 12, appVersion: "11.5.2", issues: [] },
  { id: "6", app: "com.justdial.search", score: 4, date: "2025-09-28T00:00:00Z", content: "Good app for finding local businesses. Sometimes slow but overall useful. UI could be better.", thumbsUp: 8, appVersion: "11.5.1", issues: [] },
  { id: "7", app: "com.jdseller.android", score: 1, date: "2025-10-08T00:00:00Z", content: "Wrong business listing information. My address is outdated and incorrect. Customers keep going to the wrong place. Their support is unresponsive.", thumbsUp: 31, appVersion: "2.1.0", issues: [] },
  { id: "8", app: "com.jdseller.android", score: 2, date: "2025-09-25T00:00:00Z", content: "Auto debit continues even after requesting cancellation. The ECS mandate is a trap. They keep deducting money without consent. Loot company.", thumbsUp: 44, appVersion: "2.0.9", issues: [] },
  { id: "9", app: "com.justdial.jdmart", score: 3, date: "2025-10-12T00:00:00Z", content: "No business from this platform. Paid a lot but got zero genuine customers. All leads are spam calls from marketers.", thumbsUp: 18, appVersion: "3.2.1", issues: [] },
  { id: "10", app: "com.justdial.jdmart", score: 1, date: "2025-10-14T00:00:00Z", content: "Their sales team forced me to pay by pressuring and being very aggressive on calls. Constant daily calls until I paid. Scam operation.", thumbsUp: 52, appVersion: "3.2.0", issues: [] },
  { id: "11", app: "com.jdseller.android", score: 1, date: "2025-10-02T00:00:00Z", content: "No customer support at all. Filed complaint multiple times but no resolution. They just ignore you once they have your money.", thumbsUp: 27, appVersion: "2.1.0", issues: [] },
  { id: "12", app: "com.justdial.search", score: 5, date: "2025-10-11T00:00:00Z", content: "Excellent platform. Very helpful for discovering local vendors and service providers. Highly recommend it.", thumbsUp: 5, appVersion: "11.5.2", issues: [] },
  { id: "13", app: "com.jdseller.android", score: 1, date: "2025-09-18T00:00:00Z", content: "App does not work at all. Not loading, not opening properly. Freezes constantly. Waste of time and money this useless app.", thumbsUp: 33, appVersion: "2.0.8", issues: [] },
  { id: "14", app: "com.justdial.jdmart", score: 2, date: "2025-10-07T00:00:00Z", content: "Costly package with zero ROI. Leads quality is terrible. Getting calls from job seekers and random marketing companies. Not genuine business leads.", thumbsUp: 19, appVersion: "3.1.9", issues: [] },
  { id: "15", app: "com.jdseller.android", score: 1, date: "2025-10-13T00:00:00Z", content: "Bogus leads. All fake. Paid 50,000 rupees and got fake enquiries. This is fraud. Scam company cheating small businesses.", thumbsUp: 67, appVersion: "2.1.1", issues: [] },
];
