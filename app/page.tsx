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
    title: "论文AIGC率判定",
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
          论文AIGC率检测系统
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

      <section className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-base leading-8 text-red-800">
        <p className="text-lg font-extrabold text-red-700">免责声明</p>
        <p className="mt-2">
          本网站为纯娱乐、讽刺、技术演示用途，不提供任何真实论文查重、AI生成内容检测服务。所有检测结果均为随机生成，不具备任何学术效力、法律效力，严禁用于毕业论文、课程作业、职称评审、学校提交等任何正式场景。任何单位或个人将本工具结果用于学术不端、造假、欺骗等行为，后果由使用者自行承担，开发者与本站不承担任何法律责任。
        </p>
      </section>
    </div>
  );
}
