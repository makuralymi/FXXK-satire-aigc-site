import { PrismaClient } from "@prisma/client";
import { normalizeText } from "../lib/analyzer";

const prisma = new PrismaClient();

const samples = [
  {
    name: "模板样本-方法论综述",
    content:
      "本文围绕智能写作辅助系统展开研究，首先梳理相关技术路径，其次构建评估指标体系，最后从实验结果中总结优化方向。系统在多个公开数据集上取得稳定提升，证明方法具有良好迁移能力。",
    totalAigcRate: 93.2,
  },
  {
    name: "模板样本-实验报告",
    content:
      "研究使用统一实验框架开展对比测试，模型在不同任务上的指标均优于基线方案。通过消融实验可知，策略融合模块对最终性能提升贡献显著，验证了整体算法设计的有效性。",
    totalAigcRate: 88.6,
  },
  {
    name: "模板样本-政策评论",
    content:
      "当前高校对自动化检测工具过度依赖，容易把概率输出误当事实判决。若将检测分数直接用于学术评价，不仅会放大技术偏差，也会催生围绕分数的灰色产业链。",
    totalAigcRate: 81.5,
  },
  {
    name: "模板样本-课题申请书",
    content:
      "本课题拟搭建多源语料融合平台，围绕算法透明性与可解释性展开系统研究。计划通过阶段化验证机制评估技术风险，并在应用落地环节形成可执行治理框架。",
    totalAigcRate: 86.9,
  },
];

async function main() {
  await prisma.historicalSample.deleteMany();

  await prisma.historicalSample.createMany({
    data: samples.map((sample) => ({
      ...sample,
      normalizedText: normalizeText(sample.content),
    })),
  });

  console.log(`Seeded ${samples.length} historical samples.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
