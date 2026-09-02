export interface AppInfo {
  name: string;
  rating?: number;
  totalReviews?: number;
  installs?: string;
}

export interface Review {
  id: string;
  app: string;
  score: number;
  date: string | null;
  content: string;
  thumbsUp: number;
  appVersion: string;
  issues?: string[];
}

export interface ReviewsData {
  scrapedAt: string;
  apps: Record<string, AppInfo>;
  reviews: Review[];
}

export interface IssueStats {
  name: string;
  count: number;
  pct: number;
  examples: Review[];
}

export interface AnalysisResult {
  taggedReviews: Review[];
  issueCounts: Record<string, number>;
  issueStats: IssueStats[];
  negativeCount: number;
  avgRating: number;
}
