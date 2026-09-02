"use client";
import { useEffect, useRef, useState } from "react";
import type { Review } from "@/lib/types";
import { buildWordFrequency } from "@/lib/analyzeReviews";

interface Props {
  reviews: Review[];
}

interface Word {
  text: string;
  value: number;
  x?: number;
  y?: number;
  rotate?: number;
  size?: number;
}

const ALL_COLORS = ["#60a5fa","#818cf8","#a78bfa","#34d399","#38bdf8","#f472b6","#fbbf24","#4ade80"];
const NEG_COLORS = ["#ef4444","#f97316","#fbbf24","#dc2626","#b91c1c","#f87171","#fb923c"];

function SimpleWordCloud({ words, colors }: { words: Word[]; colors: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<(Word & { x: number; y: number; size: number })[]>([]);
  const [dims, setDims] = useState({ w: 600, h: 280 });

  useEffect(() => {
    if (!containerRef.current) return;
    const { offsetWidth, offsetHeight } = containerRef.current;
    setDims({ w: offsetWidth || 600, h: offsetHeight || 280 });
  }, []);

  useEffect(() => {
    if (!words.length) return;
    const { w, h } = dims;
    const maxVal = words[0]?.value || 1;
    const result: (Word & { x: number; y: number; size: number })[] = [];

    for (const word of words.slice(0, 60)) {
      const size = Math.max(12, Math.min(40, Math.round((word.value / maxVal) * 38) + 12));
      const attempts = 80;
      for (let i = 0; i < attempts; i++) {
        const x = Math.random() * (w - 120) + 10;
        const y = Math.random() * (h - 40) + 16;
        result.push({ ...word, x, y, size });
        break;
      }
    }
    setPlaced(result);
  }, [words, dims]);

  return (
    <div ref={containerRef} className="relative w-full h-64 overflow-hidden select-none">
      {placed.map((w, i) => (
        <span
          key={w.text}
          className="absolute font-semibold whitespace-nowrap transition-all duration-300 cursor-default"
          title={`${w.text}: ${w.value}`}
          style={{
            left: w.x,
            top: w.y,
            fontSize: w.size,
            color: colors[i % colors.length],
            opacity: 0.7 + (w.size / 40) * 0.3,
            lineHeight: 1,
            transform: i % 5 === 0 ? "rotate(-15deg)" : i % 7 === 0 ? "rotate(10deg)" : undefined,
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}

export default function WordCloudViz({ reviews }: Props) {
  const [tab, setTab] = useState<"all" | "negative">("all");
  const negReviews = reviews.filter((r) => r.score <= 3);

  const allWords = buildWordFrequency(reviews);
  const negWords = buildWordFrequency(negReviews);

  const words = tab === "all" ? allWords : negWords;
  const colors = tab === "all" ? ALL_COLORS : NEG_COLORS;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Word Cloud</h2>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setTab("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tab === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setTab("negative")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              tab === "negative" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Negative Only (1–3★)
          </button>
        </div>
      </div>
      {words.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-slate-500">No data</div>
      ) : (
        <SimpleWordCloud words={words} colors={colors} />
      )}
      <p className="text-xs text-slate-600 mt-2">Top 60 words by frequency · hover for count</p>
    </div>
  );
}
