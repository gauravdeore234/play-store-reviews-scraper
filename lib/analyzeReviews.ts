import type { Review, AnalysisResult, IssueStats } from "./types";

export const ISSUE_CATEGORIES: Record<string, RegExp[]> = {
  "Fake / Spam Leads": [
    /\bfake\b.*\blead/,
    /\bspam\b.*\bcall/,
    /\bfake\b.*\bcall/,
    /\bfraud/,
    /\bscam/,
    /\bbogus/,
    /\bfake\b.*\benquir/,
    /\bjunk\b.*\blead/,
    /\bspam\b.*\blead/,
    /\bfake\b/,
  ],
  "Poor / Irrelevant Leads": [
    /\blead\b.*\bquality/,
    /\bno\b.*\blead/,
    /\birrelevant/,
    /\bwrong\b.*\bnumber/,
    /\bnot\b.*\bgenuine/,
    /\bno\b.*\benquir/,
    /\bno\b.*\bcustomer/,
    /\bno\b.*\bbusiness/,
    /\buseless/,
    /\bmarketing\b.*\blead/,
    /\bjob\b.*\blead/,
  ],
  "Aggressive Sales / Harassment": [
    /\bsales\b.*\bcall/,
    /\bkeep\b.*\bcalling/,
    /\bharass/,
    /\bpester/,
    /\bforce\b.*\bpay/,
    /\bpressur/,
    /\baggressiv/,
    /\bconstant\b.*\bcall/,
    /\bdaily\b.*\bcall/,
    /\bforcing/,
  ],
  "Overpriced / Not Worth Money": [
    /\bexpensiv/,
    /\bovercharg/,
    /\bwaste\b.*\bmoney/,
    /\bnot\b.*\bworth/,
    /\brip\b.*\boff/,
    /\bcostly/,
    /\boverpriced/,
    /\brefund/,
    /\bloot/,
    /\bcheat/,
    /\bmoney\b.*\bwaste/,
  ],
  "Cancellation / ECS Issues": [
    /\bcancel/,
    /\becs\b/,
    /\bdeduct/,
    /\bauto\b.*\bdebit/,
    /\bstop\b.*\bpayment/,
    /\bstop\b.*\bsubscription/,
    /\bdiscontinue/,
    /\bwon.t\b.*\bcancel/,
  ],
  "App Bugs / Crashes / Slow": [
    /\bcrash/,
    /\bbug/,
    /\bfreez/,
    /\bhang/,
    /\berror/,
    /\bnot\b.*\bwork/,
    /\bnot\b.*\bopen/,
    /\bnot\b.*\bload/,
    /\bslow\b/,
    /\blag/,
    /\bglitch/,
  ],
  "Wrong / Outdated Listings": [
    /\bwrong\b.*\binfo/,
    /\boutdated/,
    /\bincorrect/,
    /\bwrong\b.*\baddress/,
    /\bwrong\b.*\blisting/,
    /\binaccurate/,
    /\bclosed\b.*\bshop/,
  ],
  "Poor Customer Support": [
    /\bno\b.*\bsupport/,
    /\bcustomer\b.*\bservice/,
    /\bnot\b.*\bresolv/,
    /\bno\b.*\bhelp/,
    /\bignor/,
    /\bunresponsiv/,
    /\bno\b.*\breply/,
    /\bcomplaint/,
    /\bno\b.*\bresolution/,
  ],
};

export function categorizeReview(content: string): string[] {
  const lower = content.toLowerCase();
  const matched: string[] = [];
  for (const [category, patterns] of Object.entries(ISSUE_CATEGORIES)) {
    if (patterns.some((p) => p.test(lower))) {
      matched.push(category);
    }
  }
  return matched;
}

export function analyzeReviews(reviews: Review[]): AnalysisResult {
  const negativeReviews = reviews.filter((r) => r.score >= 1 && r.score <= 3);
  const issueCounts: Record<string, number> = {};
  const issueExamples: Record<string, Review[]> = {};

  for (const cat of Object.keys(ISSUE_CATEGORIES)) {
    issueCounts[cat] = 0;
    issueExamples[cat] = [];
  }

  const taggedReviews = reviews.map((r) => {
    if (r.score <= 3) {
      const issues = categorizeReview(r.content);
      for (const issue of issues) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        if (issueExamples[issue].length < 5) {
          issueExamples[issue].push(r);
        }
      }
      return { ...r, issues };
    }
    return { ...r, issues: [] };
  });

  const totalNeg = negativeReviews.length || 1;
  const issueStats: IssueStats[] = Object.entries(issueCounts)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / totalNeg) * 100),
      examples: issueExamples[name],
    }))
    .sort((a, b) => b.count - a.count);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.score, 0) / reviews.length
      : 0;

  return {
    taggedReviews,
    issueCounts,
    issueStats,
    negativeCount: negativeReviews.length,
    avgRating,
  };
}

export const STOP_WORDS = new Set([
  "the","a","an","is","it","in","to","and","of","for","on","with","this","that",
  "app","just","justdial","jd","dial","very","good","bad","great","nice","not",
  "have","has","was","are","been","but","from","can","will","all","they","you",
  "your","my","our","get","got","one","use","like","really","more","most","even",
  "much","also","would","could","about","some","any","been","being","does","done",
  "said","says","make","made","take","want","need","know","search","shop","travel",
  "b2b","i","me","we","he","she","they","its","am","be","by","do","at","or","if",
  "so","up","out","no","go","see","new","now","how","who","than","then","when",
  "what","which","their","there","were","these","those","into","after","before",
  "time","only","other","over","such","here","too","her","his","him","had","us",
  "per","get","give","never","always","every","still","just","give","give","please",
  "dont","dont","cant","wont","isnt","wasnt","dont","well","should","though",
]);

export function buildWordFrequency(reviews: Review[]): Array<{text: string; value: number}> {
  const freq: Record<string, number> = {};
  for (const r of reviews) {
    const words = r.content
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w));
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 80);
}
