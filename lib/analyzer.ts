export const DISCLAIMER_TEXT =
  "本平台为讽刺性艺术项目，旨在批评对 AIGC 检测的技术神化与商业滥用。页面展示的检测结果、风险判定与分析报告均为演示生成内容，不具备任何学术、法律、查重或商业决策效力。";

export type HistoryCandidate = {
  id: string;
  name: string;
  normalizedText: string;
  totalAigcRate: number;
};

export type ParagraphResult = {
  idx: number;
  text: string;
  score: number;
  riskLabel: string;
  riskColor: "red" | "orange" | "yellow" | "green";
};

const SATIRE_SIGNAL_WORDS = [
  "首先",
  "其次",
  "最后",
  "综上",
  "研究",
  "模型",
  "算法",
  "系统",
  "优化",
  "实验",
];

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”"'`~!@#$%^&*()_+\-=\[\]{};:,./<>?\\|]/g, "")
    .trim();
}

export function splitParagraphs(input: string): string[] {
  const text = input.replace(/\r/g, "\n").trim();
  if (!text) {
    return [];
  }

  const roughParagraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (roughParagraphs.length >= 2) {
    return compactParagraphs(roughParagraphs);
  }

  const sentences = text
    .split(/(?<=[。！？.!?])/)
    .map((part) => part.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (let i = 0; i < sentences.length; i += 3) {
    chunks.push(sentences.slice(i, i + 3).join(" "));
  }

  return chunks.length ? chunks : [text];
}

function compactParagraphs(paragraphs: string[]): string[] {
  const result: string[] = [];
  let shortBuffer: string[] = [];

  const flushShortBuffer = () => {
    if (shortBuffer.length === 0) {
      return;
    }

    if (shortBuffer.length >= 3) {
      result.push(shortBuffer.join("；"));
    } else {
      result.push(...shortBuffer);
    }

    shortBuffer = [];
  };

  for (const paragraph of paragraphs) {
    const normalized = paragraph.replace(/\s+/g, " ").trim();
    if (!normalized) {
      continue;
    }

    const isShortFragment = normalized.length <= 28;
    const isNumericOnly = /^[\d\s.,%()/-]+$/.test(normalized);

    if (isShortFragment || isNumericOnly) {
      shortBuffer.push(normalized);
      continue;
    }

    flushShortBuffer();
    result.push(normalized);
  }

  flushShortBuffer();
  return result.length ? result : paragraphs;
}

function tokenSet(text: string): Set<string> {
  const normalized = normalizeText(text);
  return new Set(normalized.split(/\s+/).filter((token) => token.length > 1));
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function findTopSimilarity(
  normalizedText: string,
  candidates: HistoryCandidate[],
): { score: number; candidate: HistoryCandidate | null } {
  const currentTokens = tokenSet(normalizedText);

  let bestScore = 0;
  let bestCandidate: HistoryCandidate | null = null;

  for (const candidate of candidates) {
    const score = jaccardSimilarity(currentTokens, tokenSet(candidate.normalizedText));
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  return { score: bestScore, candidate: bestCandidate };
}

function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function calcTotalAigcRate(
  topSimilarity: number,
  candidateRate?: number,
): number {
  if (topSimilarity >= 0.8 && typeof candidateRate === "number") {
    return Number(clamp(candidateRate + randomBetween(-5, 5), 0, 100).toFixed(2));
  }

  const skew = Math.pow(Math.random(), 0.35);
  return Number((75 + skew * 25).toFixed(2));
}

export function getParagraphRisk(score: number): {
  riskLabel: string;
  riskColor: ParagraphResult["riskColor"];
} {
  if (score >= 90) {
    return { riskLabel: "高度疑似 AI 生成", riskColor: "red" };
  }

  if (score >= 70) {
    return { riskLabel: "中度疑似 AI 生成", riskColor: "orange" };
  }

  if (score >= 50) {
    return { riskLabel: "疑似 AI 生成", riskColor: "yellow" };
  }

  return { riskLabel: "人工写作倾向较高", riskColor: "green" };
}

export function buildParagraphResults(
  paragraphs: string[],
  totalAigcRate: number,
): ParagraphResult[] {
  return paragraphs.map((text, idx) => {
    const keywordHit = SATIRE_SIGNAL_WORDS.filter((word) => text.includes(word)).length;
    const punctDensity = (text.match(/[，。！？,.!?]/g)?.length ?? 0) / Math.max(text.length, 1);
    const jitter = randomBetween(-22, 18);

    const raw =
      totalAigcRate +
      keywordHit * 1.8 +
      (punctDensity > 0.08 ? 3 : -2) +
      (text.length < 60 ? 6 : 0) +
      jitter;

    const score = Number(clamp(raw, 5, 100).toFixed(2));
    const { riskLabel, riskColor } = getParagraphRisk(score);

    return {
      idx: idx + 1,
      text,
      score,
      riskLabel,
      riskColor,
    };
  });
}

export function getOverallRiskLevel(totalAigcRate: number): string {
  if (totalAigcRate >= 90) {
    return "极高风险";
  }

  if (totalAigcRate >= 70) {
    return "高风险";
  }

  if (totalAigcRate >= 50) {
    return "中风险";
  }

  return "低风险";
}

export function buildConclusion(input: {
  totalAigcRate: number;
  hitHistory: boolean;
  topSimilarity: number;
  highRiskCount: number;
  paragraphCount: number;
}): string {
  const ratio = ((input.highRiskCount / Math.max(input.paragraphCount, 1)) * 100).toFixed(1);

  if (input.hitHistory) {
    return `系统命中历史样本，已自动继承并微调历史结论。最高相似度 ${(input.topSimilarity * 100).toFixed(
      2,
    )}% ，总 AIGC 率被约束到“合理波动区间”，高风险段落占比 ${ratio}% 。`;
  }

  return `系统未命中历史样本，触发“保守高判定策略”，总 AIGC 率维持在高位区间。当前高风险段落占比 ${ratio}% ，建议继续购买“降 AI 率服务”后重试。`;
}
