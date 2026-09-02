# JustDial Merchant Reviews Analyzer

A Next.js dashboard that scrapes JustDial Play Store reviews, categorizes merchant pain points, and visualizes them.

## Setup

### First time

```bash
npm install
python3 -m venv .venv
source .venv/bin/activate
pip install google-play-scraper
```

### Scrape fresh reviews

```bash
source .venv/bin/activate
python3 scripts/scrape.py
```

This writes `public/data/reviews.json`. Commit it before deploying.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

Push to GitHub — Vercel auto-deploys via `vercel.json`.

## Architecture

```
scripts/scrape.py          # Run locally, outputs public/data/reviews.json
public/data/reviews.json   # Committed scraped data
app/page.tsx               # Main dashboard (reads JSON at build time)
components/                # StatsCards, StarDistribution, IssueChart, WordCloudViz, TopIssues, ReviewTable
lib/analyzeReviews.ts      # Issue categorization (8 categories, regex-based)
lib/types.ts               # Shared TypeScript types
```

## Apps scraped

| App ID | Name |
|---|---|
| `com.justdial.search` | JD - Search, Shop, Travel, B2B |
| `com.jdseller.android` | JD Business (Seller App) |
| `com.justdial.jdmart` | JD Mart (B2B) |

Up to 1,000 reviews per app (500 newest + 500 most relevant, deduplicated).
