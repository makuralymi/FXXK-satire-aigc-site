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
          <p className="rounded-lg border-2 border-red-300 bg-red-50 p-4 text-base font-extrabold leading-8 text-red-700">
            本网站为纯娱乐、讽刺、技术演示用途，不提供任何真实论文查重、AI生成内容检测服务。所有检测结果均为随机生成，不具备任何学术效力、法律效力，严禁用于毕业论文、课程作业、职称评审、学校提交等任何正式场景。任何单位或个人将本工具结果用于学术不端、造假、欺骗等行为，后果由使用者自行承担，开发者与本站不承担任何法律责任。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
