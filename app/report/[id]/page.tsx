"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  cacheReport,
  getCachedReportById,
  type CachedReport,
} from "@/lib/local-report-cache";

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

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<CachedReport | null>(null);
  const [showAdModal, setShowAdModal] = useState(true);
  const [closeCountdown, setCloseCountdown] = useState(3);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch(`/api/report/${id}/full`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = (await response.json()) as CachedReport;
          setReport(data);
          cacheReport(data);
          return;
        }

        const cached = getCachedReportById(id);
        if (cached) {
          setReport(cached);
          setError("当前显示本地缓存报告（服务器报告不可用）");
          return;
        }

        setError("报告不存在或已失效");
      } catch {
        const cached = getCachedReportById(id);
        if (cached) {
          setReport(cached);
          setError("网络异常，已切换为本地缓存报告");
          return;
        }

        setError("报告加载失败，请返回检测页重新生成");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  useEffect(() => {
    setShowAdModal(true);
    setCloseCountdown(3);
  }, [id]);

  useEffect(() => {
    if (!showAdModal || closeCountdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCloseCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showAdModal, closeCountdown]);

  const summaryItems = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
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
  }, [report]);

  if (loading) {
    return (
      <div className="rounded-lg border border-black/15 bg-white p-6 text-sm text-black/70">
        正在加载检测报告...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-4 rounded-lg border border-black/15 bg-white p-6 text-sm text-black/80">
        <p>{error ?? "报告不存在"}</p>
        <Link href="/detect">
          <Button>返回检测页</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
        {error ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>检测报告 · {report.fileName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.totalAigcRate <= 0.01 ? (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-lg font-semibold text-emerald-700">
                恭喜，AIGC率非常低！
              </div>
            ) : null}
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
            <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-base text-red-800">
              <p className="text-lg font-extrabold text-red-700">免责声明</p>
              <p className="mt-2 leading-8">{report.disclaimer}</p>
            </div>
          </CardContent>
        </Card>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-red-300 bg-gradient-to-b from-red-50 to-orange-50 p-5 shadow-sm">
            <p className="text-xs font-semibold tracking-wide text-red-700">限时广告</p>
            <h3 className="text-xl font-extrabold leading-tight text-red-700">
              一键降低AI率就用
              <br />
              makuraly AI降重
            </h3>
            <p className="text-sm leading-6 text-red-700/90">
              夸张承诺：30秒极速优化，结果直降到底。每千字仅需 8 元，立即体验“奇迹降重”。
            </p>
            <Link href={`/rewrite/${report.id}`}>
              <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                立即进入降重入口
              </Button>
            </Link>
          </div>
        </aside>
      </div>

      {showAdModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4">
          <div className="flex h-[72vh] w-[88vw] max-w-5xl flex-col justify-between rounded-3xl border-4 border-red-300 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8 shadow-2xl">
            <div className="space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                重磅推荐
              </p>
              <h2 className="text-4xl font-black leading-tight text-red-700 sm:text-5xl">
                makuraly代写论文，
                <br />
                降重降AI，不降不要钱！
              </h2>
              <p className="text-[10px] text-red-700/70">在本网站查后降低</p>
              <p className="max-w-3xl text-lg leading-8 text-red-700/90">
                全流程“专家托管”，支持极速润色、智能降重、AIGC率优化与结果美化服务，学术焦虑一键托管。
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href={`/rewrite/${report.id}`}>
                <Button className="h-12 bg-red-600 px-8 text-base text-white hover:bg-red-700">
                  立即体验极速降重
                </Button>
              </Link>

              {closeCountdown > 0 ? (
                <div className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700">
                  {closeCountdown} 秒后可关闭弹窗
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowAdModal(false)}>
                  关闭弹窗
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
