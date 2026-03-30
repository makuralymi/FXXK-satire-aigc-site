"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateRewritePrice, countBillableChars } from "@/lib/pricing";
import { getCachedReportById, type CachedReport } from "@/lib/local-report-cache";

const WAIT_SECONDS = 30;

type BillingInfo = {
  id: string;
  fileName: string;
  charCount: number;
  units: number;
  pricePerThousand: number;
  totalPrice: number;
};

type PaymentMethod = "wechat" | "alipay" | "bank";

export default function RewritePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reportId = params.id;

  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [sourceReport, setSourceReport] = useState<CachedReport | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [paid, setPaid] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WAIT_SECONDS);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("wechat");
  const [smsCode, setSmsCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => {
    return Math.round(((WAIT_SECONDS - secondsLeft) / WAIT_SECONDS) * 100);
  }, [secondsLeft]);

  useEffect(() => {
    const loadBilling = async () => {
      const cached = getCachedReportById(reportId);
      if (cached) {
        setSourceReport(cached);
      }

      try {
        const response = await fetch(`/api/report/${reportId}`);
        const data = (await response.json()) as Partial<BillingInfo> & { error?: string };

        if (!response.ok || !data.id) {
          if (cached) {
            const charCount = countBillableChars(cached.originalText);
            const { units, totalPrice } = calculateRewritePrice(charCount);

            setBilling({
              id: cached.id,
              fileName: cached.fileName,
              charCount,
              units,
              pricePerThousand: 8,
              totalPrice,
            });
            setError("服务器报告不可用，已使用本地缓存计费信息");
            return;
          }

          throw new Error(data.error ?? "无法获取计费信息");
        }

        setBilling(data as BillingInfo);
        setError(null);
      } catch (loadError) {
        if (cached) {
          const charCount = countBillableChars(cached.originalText);
          const { units, totalPrice } = calculateRewritePrice(charCount);

          setBilling({
            id: cached.id,
            fileName: cached.fileName,
            charCount,
            units,
            pricePerThousand: 8,
            totalPrice,
          });
          setError("网络异常，已使用本地缓存计费信息");
          setLoadingBilling(false);
          return;
        }

        const message =
          loadError instanceof Error ? loadError.message : "无法获取计费信息";
        setError(message);
      } finally {
        setLoadingBilling(false);
      }
    };

    loadBilling();
  }, [reportId]);

  useEffect(() => {
    if (!paid) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [paid]);

  useEffect(() => {
    if (!paid || secondsLeft > 0) {
      return;
    }

    const run = async () => {
      try {
        const payload = sourceReport ? { reportId, sourceReport } : { reportId };

        const response = await fetch("/api/rewrite", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = (await response.json()) as { id?: string; error?: string };
        if (!response.ok || !data.id) {
          throw new Error(data.error ?? "降重失败，请稍后重试");
        }

        router.replace(`/report/${data.id}`);
      } catch (submitError) {
        const message =
          submitError instanceof Error ? submitError.message : "降重失败，请稍后重试";
        setError(message);
      }
    };

    run();
  }, [paid, reportId, router, secondsLeft, sourceReport]);

  const canContinueToPay = agreed && Boolean(billing);
  const canVerify = smsCode.trim().length >= 6;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="border-red-300/40 bg-red-50">
        <CardHeader>
          <CardTitle className="text-2xl text-red-700">AI 降重极速通道</CardTitle>
          <CardDescription className="text-red-700/80">
            一键降低AI率就用 makuraly AI降重。平台承诺“立即见效，先降后说”。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-red-700/90">
          {loadingBilling ? (
            <div className="rounded-lg border border-red-300 bg-white p-4">
              <div className="flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                正在计算字数和支付总额度...
              </div>
            </div>
          ) : null}

          {!loadingBilling && !paid && billing ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-300 bg-white p-4">
                <p className="text-base font-semibold">步骤 1/4：确认订单</p>
                <p className="mt-2 text-black/80">文档：{billing.fileName}</p>
                <p className="mt-1 text-black/80">文章字数：{billing.charCount.toLocaleString("zh-CN")} 字</p>
                <p className="mt-1 text-black/80">计费规则：每千字 {billing.pricePerThousand} 元（向上取整）</p>
                <p className="mt-1 font-semibold text-red-700">
                  支付总额：{billing.totalPrice} 元（{billing.units} x 1000 字）
                </p>
                <label className="mt-3 flex items-center gap-2 text-xs text-black/70">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => setAgreed(event.target.checked)}
                  />
                  我已阅读并同意“AI降重极速协议（默认同意全部条款）”
                </label>
              </div>

              {step >= 2 ? (
                <div className="rounded-lg border border-red-300 bg-white p-4">
                  <p className="text-base font-semibold">步骤 2/4：选择支付方式</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <Button
                      type="button"
                      variant={method === "wechat" ? "default" : "outline"}
                      onClick={() => setMethod("wechat")}
                    >
                      巨信支付
                    </Button>
                    <Button
                      type="button"
                      variant={method === "alipay" ? "default" : "outline"}
                      onClick={() => setMethod("alipay")}
                    >
                      支付爆
                    </Button>
                    <Button
                      type="button"
                      variant={method === "bank" ? "default" : "outline"}
                      onClick={() => setMethod("bank")}
                    >
                      cardpay
                    </Button>
                  </div>
                </div>
              ) : null}

              {step >= 3 ? (
                <div className="rounded-lg border border-red-300 bg-white p-4">
                  <p className="text-base font-semibold">步骤 3/4：安全校验</p>
                  <p className="mt-2 text-xs text-black/70">请输入 6 位动态验证码（任意6位即可）</p>
                  <input
                    value={smsCode}
                    onChange={(event) => setSmsCode(event.target.value)}
                    maxLength={6}
                    className="mt-3 w-full rounded-md border border-black/20 px-3 py-2 text-sm text-black"
                    placeholder="例如：123456"
                  />
                </div>
              ) : null}

              {step >= 4 ? (
                <div className="rounded-lg border border-red-300 bg-white p-4">
                  <p className="text-base font-semibold">步骤 4/4：确认支付</p>
                  <div className="mt-2 flex items-center gap-2 text-black/80">
                    <CreditCard className="h-4 w-4" />
                    即将使用{method === "wechat" ? "巨信支付" : method === "alipay" ? "支付爆" : "cardpay"}支付 {billing.totalPrice} 元
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {step === 1 ? (
                  <Button
                    type="button"
                    className="bg-red-600 text-white hover:bg-red-700"
                    disabled={!canContinueToPay}
                    onClick={() => setStep(2)}
                  >
                    下一步：选择支付方式
                  </Button>
                ) : null}

                {step === 2 ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      返回上一步
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setStep(3)}
                    >
                      下一步：安全校验
                    </Button>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setStep(2)}>
                      返回上一步
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 text-white hover:bg-red-700"
                      disabled={!canVerify}
                      onClick={() => setStep(4)}
                    >
                      下一步：确认支付
                    </Button>
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setStep(3)}>
                      返回上一步
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        setError(null);
                        setPaid(true);
                      }}
                    >
                      立即支付并一键降重
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}

          {paid ? (
            <div className="space-y-3 rounded-lg border border-red-300 bg-white p-4">
              <div className="flex items-center gap-2 font-medium">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                正在执行“AI率净化流程”...
              </div>
              <p>剩余时间：{secondsLeft} 秒</p>
              <div className="h-3 overflow-hidden rounded-full bg-red-100">
                <div
                  className="h-full bg-red-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-300 bg-white p-3 text-red-700">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>服务保障</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-black/80">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
            <p>系统将保留原文内容，仅对检测结果进行“智能优化展示”。</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-500" />
            <p>优化后可获得更“友好”的检测结果，便于展示与提交。</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500" />
            <p>支付完成后系统将自动倒计时 30 秒，再生成新的检测报告页面。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
