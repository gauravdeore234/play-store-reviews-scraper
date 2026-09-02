#!/usr/bin/env python3
"""
Scrape JustDial Play Store reviews → public/data/reviews.json
Run: python3 scripts/scrape.py
"""

import json
import os
from datetime import datetime
from google_play_scraper import Sort, reviews, app

APPS = {
    "com.justdial.search": "JD - Search, Shop, Travel, B2B",
    "com.jdseller.android": "JD Business (Seller App)",
    "com.justdial.jdmart": "JD Mart (B2B)",
}

COUNT_PER_SORT = 500


def scrape():
    output = {
        "scrapedAt": datetime.utcnow().isoformat() + "Z",
        "apps": {},
        "reviews": [],
    }

    for app_id, app_name in APPS.items():
        print(f"Scraping {app_name} ({app_id})...")

        try:
            info = app(app_id, lang="en", country="in")
            output["apps"][app_id] = {
                "name": info.get("title", app_name),
                "rating": info.get("score"),
                "totalReviews": info.get("reviews"),
                "installs": info.get("installs"),
            }
        except Exception as e:
            print(f"  Warning: could not fetch app info: {e}")
            output["apps"][app_id] = {"name": app_name}

        all_revs = []
        for sort_order in [Sort.NEWEST, Sort.MOST_RELEVANT]:
            try:
                result, _ = reviews(
                    app_id,
                    lang="en",
                    country="in",
                    sort=sort_order,
                    count=COUNT_PER_SORT,
                )
                all_revs.extend(result)
            except Exception as e:
                print(f"  Warning: {e}")

        seen = set()
        for r in all_revs:
            rid = r.get("reviewId", "")
            if rid and rid not in seen:
                seen.add(rid)
                output["reviews"].append({
                    "id": rid,
                    "app": app_id,
                    "score": r.get("score"),
                    "date": r.get("at").isoformat() if r.get("at") else None,
                    "content": r.get("content", ""),
                    "thumbsUp": r.get("thumbsUpCount", 0),
                    "appVersion": r.get("appVersion", ""),
                })

        print(f"  Got {len(seen)} unique reviews")

    out_dir = os.path.join(os.path.dirname(__file__), "..", "public", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "reviews.json")

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nDone. {len(output['reviews'])} total reviews → {out_path}")


if __name__ == "__main__":
    scrape()
