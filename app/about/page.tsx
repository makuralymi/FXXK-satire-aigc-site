import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>关于这个项目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-base leading-7 text-neutral-800">
          <p>
            本项目是一个娱乐向、讽刺向、概念型网站。它刻意模仿主流论文 AIGC
            检测平台的视觉与交互，让页面看起来非常“专业”。
          </p>
          <p>
            但底层逻辑是伪检测系统：当命中历史样本时，结果会参考历史值并做小范围波动；未命中时则倾向给出偏高风险，映射现实中某些检测行为的荒诞性。
          </p>
          <p className="rounded-lg border border-amber-300/30 bg-amber-100 p-4 text-amber-900 font-semibold">
            本平台为讽刺性艺术项目，旨在批评对 AIGC
            检测的技术神化与商业滥用。页面展示的检测结果、风险判定与分析报告均为演示生成内容，不具备任何学术、法律、查重或商业决策效力。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
