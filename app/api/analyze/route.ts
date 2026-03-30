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
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type AnalyzeSuccess = {
  id: string;
  fileName: string;
  totalAigcRate: number;
  riskLevel: string;
  createdAt: string;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请先上传文件" }, { status: 400 });
    }

    const allowedTypes = ["txt", "doc", "docx", "pdf"];
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedTypes.includes(ext)) {
      return NextResponse.json(
        { error: "仅支持 txt、doc、docx、pdf 文件" },
        { status: 400 },
      );
    }

    const originalText = (await parseUploadedFile(file)).trim();
    if (!originalText) {
      return NextResponse.json({ error: "未提取到有效文本内容" }, { status: 400 });
    }

    const paragraphs = splitParagraphs(originalText);
    const normalizedText = normalizeText(originalText);

    const [samples, reports] = await Promise.all([
      prisma.historicalSample.findMany(),
      prisma.analysisReport.findMany({
        select: {
          id: true,
          fileName: true,
          normalizedText: true,
          totalAigcRate: true,
        },
        take: 100,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const candidates = [
      ...samples.map((sample) => ({
        id: sample.id,
        name: sample.name,
        normalizedText: sample.normalizedText,
        totalAigcRate: sample.totalAigcRate,
      })),
      ...reports.map((report) => ({
        id: report.id,
        name: `历史报告:${report.fileName}`,
        normalizedText: report.normalizedText,
        totalAigcRate: report.totalAigcRate,
      })),
    ];

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

    const report = await prisma.analysisReport.create({
      data: {
        fileName: file.name,
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
        paragraphs: {
          create: paragraphResults,
        },
      },
    });

    return NextResponse.json<AnalyzeSuccess>({
      id: report.id,
      fileName: report.fileName,
      totalAigcRate: report.totalAigcRate,
      riskLevel: report.riskLevel,
      createdAt: report.createdAt.toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "检测服务繁忙，请稍后重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
