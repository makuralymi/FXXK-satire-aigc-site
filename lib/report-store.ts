import { normalizeText, type HistoryCandidate, type ParagraphResult } from "@/lib/analyzer";

export type StoredParagraph = ParagraphResult & {
  id: string;
};

export type StoredReport = {
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
  paragraphs: StoredParagraph[];
};

const HISTORICAL_SAMPLES: HistoryCandidate[] = [
  {
    id: "sample-1",
    name: "模板样本-方法论综述",
    normalizedText: normalizeText(
      "本文围绕智能写作辅助系统展开研究，首先梳理相关技术路径，其次构建评估指标体系，最后从实验结果中总结优化方向。系统在多个公开数据集上取得稳定提升，证明方法具有良好迁移能力。",
    ),
    totalAigcRate: 93.2,
  },
  {
    id: "sample-2",
    name: "模板样本-实验报告",
    normalizedText: normalizeText(
      "研究使用统一实验框架开展对比测试，模型在不同任务上的指标均优于基线方案。通过消融实验可知，策略融合模块对最终性能提升贡献显著，验证了整体算法设计的有效性。",
    ),
    totalAigcRate: 88.6,
  },
  {
    id: "sample-3",
    name: "模板样本-政策评论",
    normalizedText: normalizeText(
      "当前高校对自动化检测工具过度依赖，容易把概率输出误当事实判决。若将检测分数直接用于学术评价，不仅会放大技术偏差，也会催生围绕分数的灰色产业链。",
    ),
    totalAigcRate: 81.5,
  },
  {
    id: "sample-4",
    name: "模板样本-课题申请书",
    normalizedText: normalizeText(
      "本课题拟搭建多源语料融合平台，围绕算法透明性与可解释性展开系统研究。计划通过阶段化验证机制评估技术风险，并在应用落地环节形成可执行治理框架。",
    ),
    totalAigcRate: 86.9,
  },
];

const REPORT_MEMORY_KEY = "__satire_aigc_reports__";

function getReportMap(): Map<string, StoredReport> {
  const globalStore = globalThis as typeof globalThis & {
    [REPORT_MEMORY_KEY]?: Map<string, StoredReport>;
  };

  if (!globalStore[REPORT_MEMORY_KEY]) {
    globalStore[REPORT_MEMORY_KEY] = new Map<string, StoredReport>();
  }

  return globalStore[REPORT_MEMORY_KEY];
}

export function listHistoryCandidates(): HistoryCandidate[] {
  const reportCandidates = Array.from(getReportMap().values())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 100)
    .map((report) => ({
      id: report.id,
      name: `历史报告:${report.fileName}`,
      normalizedText: report.normalizedText,
      totalAigcRate: report.totalAigcRate,
    }));

  return [...HISTORICAL_SAMPLES, ...reportCandidates];
}

export function saveReport(
  input: Omit<StoredReport, "id" | "createdAt" | "paragraphs"> & {
    paragraphs: ParagraphResult[];
  },
): StoredReport {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const paragraphs = input.paragraphs.map((paragraph) => ({
    ...paragraph,
    id: crypto.randomUUID(),
  }));

  const report: StoredReport = {
    ...input,
    id,
    createdAt,
    paragraphs,
  };

  getReportMap().set(id, report);
  return report;
}

export function getReportById(id: string): StoredReport | null {
  return getReportMap().get(id) ?? null;
}
