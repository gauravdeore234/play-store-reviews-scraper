import { readFileSync } from "fs";
import path from "path";
import type { ReviewsData } from "@/lib/types";
import Dashboard from "@/components/Dashboard";

const DEMO_REVIEWS = [
  { id: "1", app: "com.jdseller.android", score: 1, date: "2025-10-01T00:00:00Z", content: "Complete fraud and scam. They gave me fake leads, all calls were from marketing companies not real customers. Waste of money, do not buy their packages.", thumbsUp: 45, appVersion: "2.1.0" },
  { id: "2", app: "com.jdseller.android", score: 1, date: "2025-09-15T00:00:00Z", content: "Their sales team keeps calling and harassing me every day. I asked them to cancel my subscription and stop the ECS deduction but they won't cancel. Worst customer service ever.", thumbsUp: 38, appVersion: "2.0.9" },
  { id: "3", app: "com.jdseller.android", score: 2, date: "2025-09-20T00:00:00Z", content: "Overpriced package. Got irrelevant leads — job seekers calling me not actual customers. Refund request was ignored. Not worth the money at all.", thumbsUp: 29, appVersion: "2.1.1" },
  { id: "4", app: "com.jdseller.android", score: 1, date: "2025-10-10T00:00:00Z", content: "App crashes every time I try to view my leads. Huge bug in the notification system. Slow to load and hangs for minutes.", thumbsUp: 22, appVersion: "2.0.8" },
  { id: "5", app: "com.justdial.search", score: 5, date: "2025-10-05T00:00:00Z", content: "Very useful app. Found great local service providers quickly. The search feature works well and the ratings are helpful.", thumbsUp: 12, appVersion: "11.5.2" },
  { id: "6", app: "com.justdial.search", score: 4, date: "2025-09-28T00:00:00Z", content: "Good app for finding local businesses. Sometimes slow but overall useful. UI could be better.", thumbsUp: 8, appVersion: "11.5.1" },
  { id: "7", app: "com.jdseller.android", score: 1, date: "2025-10-08T00:00:00Z", content: "Wrong business listing information. My address is outdated and incorrect. Customers keep going to the wrong place. Their support is unresponsive.", thumbsUp: 31, appVersion: "2.1.0" },
  { id: "8", app: "com.jdseller.android", score: 2, date: "2025-09-25T00:00:00Z", content: "Auto debit continues even after requesting cancellation. The ECS mandate is a trap. They keep deducting money without consent. Loot company.", thumbsUp: 44, appVersion: "2.0.9" },
  { id: "9", app: "com.justdial.jdmart", score: 3, date: "2025-10-12T00:00:00Z", content: "No business from this platform. Paid a lot but got zero genuine customers. All leads are spam calls from marketers.", thumbsUp: 18, appVersion: "3.2.1" },
  { id: "10", app: "com.justdial.jdmart", score: 1, date: "2025-10-14T00:00:00Z", content: "Their sales team forced me to pay by pressuring and being very aggressive on calls. Constant daily calls until I paid. Scam operation.", thumbsUp: 52, appVersion: "3.2.0" },
  { id: "11", app: "com.jdseller.android", score: 1, date: "2025-10-02T00:00:00Z", content: "No customer support at all. Filed complaint multiple times but no resolution. They just ignore you once they have your money.", thumbsUp: 27, appVersion: "2.1.0" },
  { id: "12", app: "com.justdial.search", score: 5, date: "2025-10-11T00:00:00Z", content: "Excellent platform. Very helpful for discovering local vendors and service providers. Highly recommend it.", thumbsUp: 5, appVersion: "11.5.2" },
  { id: "13", app: "com.jdseller.android", score: 1, date: "2025-09-18T00:00:00Z", content: "App does not work at all. Not loading, not opening properly. Freezes constantly. Waste of time and money this useless app.", thumbsUp: 33, appVersion: "2.0.8" },
  { id: "14", app: "com.justdial.jdmart", score: 2, date: "2025-10-07T00:00:00Z", content: "Costly package with zero ROI. Leads quality is terrible. Getting calls from job seekers and random marketing companies. Not genuine business leads.", thumbsUp: 19, appVersion: "3.1.9" },
  { id: "15", app: "com.jdseller.android", score: 1, date: "2025-10-13T00:00:00Z", content: "Bogus leads. All fake. Paid 50,000 rupees and got fake enquiries. This is fraud. Scam company cheating small businesses.", thumbsUp: 67, appVersion: "2.1.1" },
];

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
  return <Dashboard initialData={data} />;
}
