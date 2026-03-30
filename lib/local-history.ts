export type LocalDetectionRecord = {
  id: string;
  fileName: string;
  totalAigcRate: number;
  riskLevel: string;
  createdAt: string;
};

const STORAGE_KEY = "satire_aigc_detection_history";
const MAX_RECORDS = 30;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getDetectionHistory(): LocalDetectionRecord[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as LocalDetectionRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.fileName === "string" &&
        typeof item.totalAigcRate === "number" &&
        typeof item.riskLevel === "string" &&
        typeof item.createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function addDetectionRecord(record: LocalDetectionRecord) {
  if (!isBrowser()) {
    return;
  }

  const previous = getDetectionHistory();
  const deduped = previous.filter((item) => item.id !== record.id);
  const next = [record, ...deduped].slice(0, MAX_RECORDS);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearDetectionHistory() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
