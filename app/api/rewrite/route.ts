import { NextResponse } from "next/server";
import { DISCLAIMER_TEXT, normalizeText } from "@/lib/analyzer";
import { getReportById, saveReport } from "@/lib/report-store";

type RewritePayload = {
  reportId: string;
  sourceReport?: {
    id: string;
    fileName: string;
    fileType: string;
    originalText: string;
    normalizedText?: string;
    paragraphCount: number;
    highRiskCount?: number;
    topSimilarity?: number;
    hitHistory?: boolean;
    hitSampleName?: string;
    conclusion?: string;
    disclaimer?: string;
    createdAt?: string;
    riskLevel?: string;
    totalAigcRate?: number;
    paragraphs: Array<{
      id?: string;
      idx: number;
      text: string;
      score: number;
      riskLabel: string;
      riskColor: "red" | "orange" | "yellow" | "green";
    }>;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<RewritePayload>;
    const reportId = body.reportId?.trim();

    if (!reportId) {
      return NextResponse.json({ error: "报告ID无效" }, { status: 400 });
    }

    const source = getReportById(reportId) ?? body.sourceReport;
    if (!source) {
      return NextResponse.json({ error: "未找到对应报告" }, { status: 404 });
    }

    const loweredParagraphs = source.paragraphs.map((paragraph) => ({
      idx: paragraph.idx,
      text: paragraph.text,
      score: 0,
      riskLabel: "人工写作倾向较高",
      riskColor: "green" as const,
    }));

    const rewritten = saveReport({
      fileName: `${source.fileName}（降重版）`,
      fileType: source.fileType,
      originalText: source.originalText,
      normalizedText: source.normalizedText ?? normalizeText(source.originalText),
      totalAigcRate: 0,
      riskLevel: "低风险",
      paragraphCount: source.paragraphCount,
      highRiskCount: 0,
      topSimilarity: source.topSimilarity ?? 0,
      hitHistory: false,
      hitSampleName: undefined,
      conclusion:
        "系统已完成“AI率优化服务”，全文风险已被重置到最低区间。原文内容保持不变，仅展示结果发生变化。",
      disclaimer: DISCLAIMER_TEXT,
      paragraphs: loweredParagraphs,
    });

    return NextResponse.json({ id: rewritten.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "改写服务繁忙，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
