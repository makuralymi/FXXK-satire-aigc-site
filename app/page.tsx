import Link from "next/link";
import { ArrowRight, ScanSearch, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: ScanSearch,
    title: "多格式论文检测",
    description: "支持 txt/doc/docx/pdf 上传，自动分段并给出专业风格可视化报告。",
  },
  {
    icon: Sparkles,
    title: "神谕级算法判定",
    description: "命中历史样本时自动继承历史结论，不命中时保持高风险输出。",
  },
  {
    icon: TriangleAlert,
    title: "商业化整改建议",
    description: "如果结果太高，建议再用 AI 降 AI 率后重新检测，循环增值。",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-black/15 bg-white p-8 shadow-[0_14px_40px_rgba(0,0,0,0.12)]">

        <Badge variant="default" className="mb-4">
          专业检测平台视觉外壳 · 讽刺性概念内核
        </Badge>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-black sm:text-5xl">
          AIGC 论文检测神谕系统
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/80 sm:text-base">
          这是一个娱乐向、讽刺向的伪检测网站。它模仿主流平台的交互体验，展示
          “用 AI 检测 AI，再用 AI 改 AI 率来降 AI 率”这类行为中的荒诞逻辑。
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href="/detect">
            <Button>
              立即开始检测
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline">查看项目说明</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item) => (
          <Card key={item.title} className="bg-white">
            <CardHeader>
              <item.icon className="h-5 w-5 text-black" />
              <CardTitle className="mt-2">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-black/75">
              {item.description}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border border-black/20 bg-white p-6 text-sm leading-7 text-black/90">
        <p className="font-semibold">免责声明</p>
        <p className="mt-2">
          本平台为讽刺性艺术项目，旨在批评对 AIGC
          检测的技术神化与商业滥用。页面展示的检测结果、风险判定与分析报告均为演示生成内容，不具备任何学术、法律、查重或商业决策效力。
        </p>
      </section>
    </div>
  );
}
