# AIGC 论文检测系统

一个娱乐向、讽刺向、概念型网站，模仿主流论文 AIGC 检测平台。

## 技术栈

- Next.js 16 (App Router，满足 14+)
- TypeScript
- Tailwind CSS v4
- shadcn/ui 风格组件（本地组件实现）
- Prisma + SQLite

## 功能清单

- 上传 txt/doc/docx/pdf 文件
- 自动解析文本并分段
- 生成总 AIGC 率
- 段落级 AI 疑似率与风险颜色标记
- 报告写入 SQLite 数据库
- 与历史样本相似度对比
- 相似度逻辑：
  - >= 80%：总 AIGC 率参考历史样本，控制在 ±5% 波动
  - < 80%：总 AIGC 率在 75%~100% 区间偏高生成
- 完整报告页（总览、段落分析、高亮原文、结论、免责声明）

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 初始化数据库结构

```bash
npm run db:migrate
```

3. 填充历史样本

```bash
npm run db:seed
```

4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 目录结构

```text
app/
  api/analyze/route.ts      # 上传解析 + 检测 + 入库
  detect/page.tsx           # 检测页
  report/[id]/page.tsx      # 报告页
  about/page.tsx            # 关于页
  page.tsx                  # 首页
components/
  ui/                       # shadcn 风格组件
lib/
  analyzer.ts               # 分段、相似度、伪检测算法
  file-parser.ts            # txt/doc/docx/pdf 解析
  prisma.ts                 # Prisma Client
prisma/
  schema.prisma             # 数据模型
  seed.ts                   # 历史样本种子
```

## 免责声明

本平台为讽刺性艺术项目，旨在批评对 AIGC 检测的技术神化与商业滥用。页面展示的检测结果、风险判定与分析报告均为演示生成内容，不具备任何学术、法律、查重或商业决策效力。
