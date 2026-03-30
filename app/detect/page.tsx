"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseFileInBrowser } from "@/lib/client-file-parser";
import {
  addDetectionRecord,
  clearDetectionHistory,
  getDetectionHistory,
  type LocalDetectionRecord,
} from "@/lib/local-history";

export default function DetectPage() {
  const MAX_FILE_SIZE_MB = 8;
  const MAX_TEXT_LENGTH = 250000;
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LocalDetectionRecord[]>([]);

  const supportText = useMemo(() => "支持格式：txt / doc / docx / pdf", []);

  useEffect(() => {
    setHistory(getDetectionHistory());
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("请先选择文件");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`文件过大，请上传小于 ${MAX_FILE_SIZE_MB}MB 的文件`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { ext, text } = await parseFileInBrowser(file);
      if (!text) {
        throw new Error("未提取到有效文本内容");
      }

      if (text.length > MAX_TEXT_LENGTH) {
        throw new Error("文本内容过长，请拆分文件后重试");
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: ext,
          originalText: text,
        }),
      });

      const raw = await response.text();
      let data: {
        id?: string;
        fileName?: string;
        totalAigcRate?: number;
        riskLevel?: string;
        createdAt?: string;
        error?: string;
      };

      try {
        data = JSON.parse(raw) as typeof data;
      } catch {
        throw new Error(
          response.ok
            ? "服务返回了非 JSON 数据，请稍后重试"
            : `服务异常（${response.status}）: ${raw.slice(0, 120) || "无详细信息"}`,
        );
      }

      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "检测失败");
      }

      if (
        data.fileName &&
        typeof data.totalAigcRate === "number" &&
        data.riskLevel &&
        data.createdAt
      ) {
        addDetectionRecord({
          id: data.id,
          fileName: data.fileName,
          totalAigcRate: data.totalAigcRate,
          riskLevel: data.riskLevel,
          createdAt: data.createdAt,
        });
        setHistory(getDetectionHistory());
      }

      router.push(`/report/${data.id}`);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "请求失败，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>上传文稿并启动论文AIGC率检测</CardTitle>
          <CardDescription>
            {supportText}。系统将自动分段、生成段落疑似率并输出完整报告。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-black/25 bg-white p-8 text-center transition hover:bg-black/5"
            >
              <FileUp className="h-8 w-8 text-black" />
              <div>
                <p className="text-sm font-medium text-black">
                  点击选择文件，或拖拽到此区域
                </p>
                <p className="mt-1 text-xs text-black/65">
                  检测结果越高并不意味着越准确，但通常意味着“更专业”
                </p>
              </div>
            </label>
            <input
              id="file"
              type="file"
              accept=".txt,.doc,.docx,.pdf"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
              }}
            />

            <div className="rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black/80">
              当前文件：{file ? file.name : "尚未选择"}
            </div>

            {error ? (
              <div className="rounded-md border border-white/40 bg-white/10 px-3 py-2 text-sm text-white">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  正在分析中...
                </>
              ) : (
                "生成检测报告"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>本地检测记录</CardTitle>
              <CardDescription>仅保存在当前浏览器，不会上传到服务器。</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                clearDetectionHistory();
                setHistory([]);
              }}
            >
              <Trash2 className="h-4 w-4" />
              清空
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="rounded-lg border border-black/15 bg-white p-4 text-sm text-black/60">
              暂无本地记录，完成一次检测后会自动保存。
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/15 bg-white p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">{item.fileName}</p>
                    <p className="mt-1 text-xs text-black/60">
                      AIGC 率 {item.totalAigcRate.toFixed(2)}% · {item.riskLevel} · {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                  <Link href={`/report/${item.id}`}>
                    <Button size="sm">查看报告</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
