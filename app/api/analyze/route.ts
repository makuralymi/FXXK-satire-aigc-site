import { NextResponse } from "next/server";
import {
  buildConclusion,
  buildParagraphResults,
  calcTotalAigcRate,
  DISCLAIMER_TEXT,
  findTopSimilarity,
  getOverallRiskLevel,
  normalizeText,
  splitParagraphs,
} from "@/lib/analyzer";
import { parseUploadedFile } from "@/lib/file-parser";
import { listHistoryCandidates, saveReport } from "@/lib/report-store";

export const runtime = "edge";

type AnalyzeSuccess = {
  id: string;
  fileName: string;
  totalAigcRate: number;
  riskLevel: string;
  createdAt: string;
};

type AnalyzePayload = {
  fileName: string;
  fileType: string;
  originalText: string;
};

const MAX_TEXT_LENGTH = 250000;

export async function POST(request: Request) {
  try {
    let fileName = "";
    let ext = "";
    let originalText = "";

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Partial<AnalyzePayload>;
      fileName = body.fileName?.trim() ?? "";
      ext = body.fileType?.trim().toLowerCase() ?? "";
      originalText = body.originalText?.trim() ?? "";
    } else {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "请先上传文件" }, { status: 400 });
      }

      fileName = file.name;
      ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      originalText = (await parseUploadedFile(file)).trim();
    }

    if (!fileName || !ext) {
      return NextResponse.json({ error: "文件信息无效" }, { status: 400 });
    }

    if (ext === "doc") {
      return NextResponse.json(
        { error: "doc 暂不支持，请先另存为 docx 后上传" },
        { status: 400 },
      );
    }

    const allowedTypes = ["txt", "docx", "pdf"];
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json({ error: "仅支持 txt、docx、pdf 文件" }, { status: 400 });
    }

    if (!originalText) {
      return NextResponse.json({ error: "未提取到有效文本内容" }, { status: 400 });
    }

    if (originalText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "文本内容过长，请拆分文件后重试" },
        { status: 413 },
      );
    }

    const paragraphs = splitParagraphs(originalText);
    const normalizedText = normalizeText(originalText);

    const candidates = listHistoryCandidates();

    const { score: topSimilarity, candidate } = findTopSimilarity(
      normalizedText,
      candidates,
    );

    const totalAigcRate = calcTotalAigcRate(topSimilarity, candidate?.totalAigcRate);
    const paragraphResults = buildParagraphResults(paragraphs, totalAigcRate);
    const highRiskCount = paragraphResults.filter((item) => item.score >= 90).length;
    const riskLevel = getOverallRiskLevel(totalAigcRate);

    const conclusion = buildConclusion({
      totalAigcRate,
      hitHistory: topSimilarity >= 0.8,
      topSimilarity,
      highRiskCount,
      paragraphCount: paragraphResults.length,
    });

    const report = saveReport({
      fileName,
      fileType: ext,
      originalText,
      normalizedText,
      totalAigcRate,
      riskLevel,
      paragraphCount: paragraphResults.length,
      highRiskCount,
      topSimilarity,
      hitHistory: topSimilarity >= 0.8,
      hitSampleName: candidate?.name,
      conclusion,
      disclaimer: DISCLAIMER_TEXT,
      paragraphs: paragraphResults,
    });

    return NextResponse.json<AnalyzeSuccess>({
      id: report.id,
      fileName: report.fileName,
      totalAigcRate: report.totalAigcRate,
      riskLevel: report.riskLevel,
      createdAt: report.createdAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "检测服务繁忙，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
