import { NextResponse } from "next/server";
import { getReportById } from "@/lib/report-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const report = getReportById(id);

  if (!report) {
    return NextResponse.json({ error: "未找到报告" }, { status: 404 });
  }

  return NextResponse.json(report);
}
