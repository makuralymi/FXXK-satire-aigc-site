import { NextResponse } from "next/server";
import { getReportById } from "@/lib/report-store";
import { calculateRewritePrice, countBillableChars } from "@/lib/pricing";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = getReportById(id);

  if (!report) {
    return NextResponse.json({ error: "未找到报告" }, { status: 404 });
  }

  const charCount = countBillableChars(report.originalText);
  const { units, totalPrice } = calculateRewritePrice(charCount);

  return NextResponse.json({
    id: report.id,
    fileName: report.fileName,
    charCount,
    units,
    pricePerThousand: 8,
    totalPrice,
  });
}
