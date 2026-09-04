import type { Review, AnalysisResult, IssueStats } from "./types";

export const ISSUE_CATEGORIES: Record<string, RegExp[]> = {
  "App Crashes / Performance": [
    /\bcrash/,
    /\bfreez/,
    /\bhang(s|ing)?\b/,
    /\bslow\b/,
    /\blag(s|ging)?\b/,
    /\bglitch/,
    /\bstuck/,
    /\bunresponsive/,
    /\bnot\b.*\brespond/,
    /\bkeeps?\b.*\bcrash/,
    /\bforce\b.*\bclos/,
    /\bapp\b.*\bdied/,
  ],
  "App Not Working / Bugs": [
    /\bbug\b/,
    /\berror\b/,
    /\bnot\b.*\bwork/,
    /\bdoesn.t\b.*\bwork/,
    /\bwon.t\b.*\bopen/,
    /\bnot\b.*\bload/,
    /\bblank\b.*\bscreen/,
    /\bwhite\b.*\bscreen/,
    /\bbroken/,
    /\bfail/,
    /\bissue/,
    /\bproblem/,
    /\bnot\b.*\bopen/,
    /\bstop(ped)?\b.*\bwork/,
  ],
  "Login / Account Issues": [
    /\blogin\b/,
    /\bsign\b.*\bin\b/,
    /\bsign\b.*\bup\b/,
    /\baccount\b/,
    /\bpassword/,
    /\botp\b/,
    /\bverif/,
    /\bauthent/,
    /\blocke?d?\b.*\bout/,
    /\bcannot\b.*\baccess/,
    /\bcan.t\b.*\blog/,
    /\bregist/,
  ],
  "Payment / Billing Issues": [
    /\bpayment/,
    /\bcharge/,
    /\brefund/,
    /\bsubscri/,
    /\bcancel/,
    /\bbill/,
    /\btransaction/,
    /\bauto\b.*\bdebit/,
    /\bdeduct/,
    /\bwaste\b.*\bmoney/,
    /\bmoney\b.*\bwaste/,
    /\bnot\b.*\bworth/,
    /\brip\b.*\boff/,
    /\bovercharg/,
    /\bexpensiv/,
    /\bloot/,
    /\bscam/,
    /\bfraud/,
  ],
  "Poor Customer Support": [
    /\bsupport\b/,
    /\bcustomer\b.*\bservice/,
    /\bservice\b.*\bterri/,
    /\bno\b.*\bhelp/,
    /\bnot\b.*\bresolv/,
    /\bignor/,
    /\bunresponsiv/,
    /\bno\b.*\breply/,
    /\bcomplaint/,
    /\bno\b.*\bresponse/,
    /\bhelpless/,
    /\bawful\b.*\bservice/,
  ],
  "Privacy / Spam / Ads": [
    /\bspam/,
    /\bads?\b/,
    /\badvertis/,
    /\bprivacy/,
    /\bpermission/,
    /\bdata\b.*\bsteal/,
    /\bpersonal\b.*\bdata/,
    /\btoo\b.*\bmany\b.*\bnotif/,
    /\bnonstop\b.*\bnotif/,
    /\bconstant\b.*\bnotif/,
    /\btracking/,
    /\bharass/,
    /\bunwanted\b.*\bcall/,
    /\bkeep\b.*\bcalling/,
  ],
  "Bad UI / Hard to Use": [
    /\bui\b/,
    /\bux\b/,
    /\binterface/,
    /\bdesign\b.*\bbad/,
    /\bbad\b.*\bdesign/,
    /\bconfus/,
    /\bcomplicat/,
    /\bdifficult\b.*\buse/,
    /\bhard\b.*\bnavig/,
    /\bnot\b.*\bintuitive/,
    /\bpoor\b.*\bdesign/,
    /\bawful\b.*\bdesign/,
    /\bugly/,
    /\bclutter/,
  ],
  "Missing Features / Content": [
    /\bmissing\b/,
    /\bfeature\b/,
    /\bneed\b.*\boption/,
    /\bwish\b.*\bhad/,
    /\bshould\b.*\bhave/,
    /\bplease\b.*\badd/,
    /\badd\b.*\bfeature/,
    /\bno\b.*\boption/,
    /\blimited\b/,
    /\bcant\b.*\bfind/,
    /\bcan.t\b.*\bfind/,
    /\bnot\b.*\benough/,
    /\bimprove/,
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
