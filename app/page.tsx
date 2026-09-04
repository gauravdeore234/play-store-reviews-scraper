import type { ReviewsData } from "@/lib/types";
import Dashboard from "@/components/Dashboard";

const EMPTY_DATA: ReviewsData = {
  scrapedAt: new Date().toISOString(),
  apps: {},
  reviews: [],
};

export default function Home() {
  return <Dashboard initialData={EMPTY_DATA} />;
}
