export type CachedReportParagraph = {
  id: string;
  idx: number;
  text: string;
  score: number;
  riskLabel: string;
  riskColor: "red" | "orange" | "yellow" | "green";
};

export type CachedReport = {
  id: string;
  fileName: string;
  fileType: string;
  originalText: string;
  normalizedText: string;
  totalAigcRate: number;
  riskLevel: string;
  paragraphCount: number;
  highRiskCount: number;
  topSimilarity: number;
  hitHistory: boolean;
  hitSampleName?: string;
  conclusion: string;
  disclaimer: string;
  createdAt: string;
  paragraphs: CachedReportParagraph[];
};

const STORAGE_KEY = "satire_aigc_report_cache";
const MAX_REPORTS = 20;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readAll(): CachedReport[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CachedReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(reports: CachedReport[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
}

export function cacheReport(report: CachedReport) {
  const existing = readAll().filter((item) => item.id !== report.id);
  writeAll([report, ...existing]);
}

export function getCachedReportById(id: string): CachedReport | null {
  return readAll().find((item) => item.id === id) ?? null;
}
