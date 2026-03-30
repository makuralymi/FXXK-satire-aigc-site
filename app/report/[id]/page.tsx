import { notFound } from "next/navigation";
import { getReportById } from "@/lib/report-store";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ReportPageProps = {
  params: Promise<{ id: string }>;
};

function colorClasses(color: string) {
  if (color === "red") {
    return {
      badge: "default" as const,
      bar: "bg-rose-500",
      block: "border-rose-300/40 bg-rose-500/10",
    };
  }

  if (color === "orange") {
    return {
      badge: "orange" as const,
      bar: "bg-orange-500",
      block: "border-orange-300/40 bg-orange-500/10",
    };
  }

  if (color === "yellow") {
    return {
      badge: "yellow" as const,
      bar: "bg-yellow-500",
      block: "border-yellow-300/40 bg-yellow-500/10",
    };
  }

  return {
    badge: "green" as const,
    bar: "bg-emerald-500",
    block: "border-emerald-300/40 bg-emerald-500/10",
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;

  const report = getReportById(id);

  if (!report) {
    notFound();
  }

  const summaryItems = [
    { label: "总 AIGC 率", value: `${report.totalAigcRate.toFixed(2)}%` },
    { label: "风险等级", value: report.riskLevel },
    { label: "段落总数", value: `${report.paragraphCount}` },
    { label: "高风险段落数", value: `${report.highRiskCount}` },
    {
      label: "历史样本最高相似度",
      value: `${(report.topSimilarity * 100).toFixed(2)}%`,
    },
    {
      label: "是否命中历史样本",
      value: report.hitHistory
        ? `是（${report.hitSampleName ?? "未知样本"}）`
        : "否",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>检测报告 · {report.fileName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={report.totalAigcRate} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-black/15 bg-white p-4"
              >
                <p className="text-xs text-black/65">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-black">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>段落级分析列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.paragraphs.map((paragraph) => {
            const color = colorClasses(paragraph.riskColor);
            return (
              <div key={paragraph.id} className="rounded-lg border border-black/15 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-black">段落 {paragraph.idx}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant={color.badge}>{paragraph.riskLabel}</Badge>
                    <span className="font-mono text-xs text-black/65">
                      {paragraph.score.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <Progress value={paragraph.score} indicatorClassName={color.bar} />
                <p className="mt-3 text-sm leading-7 text-black/80">{paragraph.text}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>原文高亮视图</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.paragraphs.map((paragraph) => {
            const color = colorClasses(paragraph.riskColor);
            return (
              <div
                key={`highlight-${paragraph.id}`}
                className={`rounded-lg border p-4 text-sm leading-7 text-black/85 ${color.block}`}
              >
                {paragraph.text}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>综合分析结论</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-black/80">
          <p>{report.conclusion}</p>
          <div className="rounded-lg border border-black/20 bg-white p-4 text-black/85">
            <p className="font-semibold">免责声明</p>
            <p className="mt-2">{report.disclaimer}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
