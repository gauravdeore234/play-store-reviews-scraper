import { NextRequest, NextResponse } from "next/server";

function extractAppId(input: string): string | null {
  input = input.trim();
  if (/^[a-zA-Z][a-zA-Z0-9_.]+$/.test(input) && !input.startsWith("http")) {
    return input;
  }
  try {
    const url = new URL(input);
    return url.searchParams.get("id");
  } catch {
    return null;
  }
}

type RawReview = {
  id: string;
  score: number;
  date: string;
  text: string;
  thumbsUp: number;
  version: string;
};

export async function POST(req: NextRequest) {
  let body: { url?: string; count?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const appId = extractAppId(body.url ?? "");
  if (!appId) {
    return NextResponse.json(
      { error: "Could not extract app ID. Paste a Play Store URL like https://play.google.com/store/apps/details?id=com.example.app" },
      { status: 400 }
    );
  }

  const numPerPass = Math.min(body.count ?? 500, 500);
  const gplay = (await import("google-play-scraper")).default;

  // Fetch app metadata
  let appInfo: Record<string, unknown> = { name: appId };
  try {
    const info = await gplay.app({ appId, lang: "en", country: "in" }) as unknown as Record<string, unknown>;
    appInfo = {
      name: info.title ?? appId,
      rating: info.score,
      totalReviews: info.reviews,
      installs: info.installs,
      developer: info.developer,
    };
  } catch {
    // non-fatal — continue with reviews
  }

  // Fetch two pages of reviews (paginated) to get up to 1000 unique reviews
  const allRevs: RawReview[] = [];
  let nextToken: string | undefined = undefined;

  for (let page = 0; page < 2; page++) {
    try {
      const opts: Record<string, unknown> = {
        appId,
        lang: "en",
        country: "in",
        num: numPerPass,
        paginate: true,
      };
      if (nextToken) opts.nextPaginationToken = nextToken;

      const result = await (gplay.reviews as unknown as (o: Record<string, unknown>) => Promise<{ data: RawReview[]; nextPaginationToken?: string }>)(opts);
      allRevs.push(...result.data);
      nextToken = result.nextPaginationToken;
      if (!nextToken) break;
    } catch {
      break;
    }
  }

  const seen = new Set<string>();
  const reviews: unknown[] = [];
  for (const r of allRevs) {
    if (r.id && !seen.has(r.id)) {
      seen.add(r.id);
      reviews.push({
        id: r.id,
        app: appId,
        score: r.score,
        date: r.date ? new Date(r.date).toISOString() : null,
        content: r.text ?? "",
        thumbsUp: r.thumbsUp ?? 0,
        appVersion: r.version ?? "",
      });
    }
  }

  return NextResponse.json({
    scrapedAt: new Date().toISOString(),
    apps: { [appId]: appInfo },
    reviews,
  });
}
