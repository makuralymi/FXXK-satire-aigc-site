# AIGC 论文检测系统

一个娱乐向、讽刺向、概念型网站，模仿主流论文 AIGC 检测平台。
大学生苦毕业论文久矣，前有查重后有查AI，又花钱又费力，往往最后身心俱疲。
本项目致力于博君一笑，对这些压榨人的东西say fxxk！
如果你被气笑了，那这个项目就成功了。
示例网站：https://aigc.makuraly.xyz/

## 技术栈

- Next.js 16 (App Router，满足 14+)
- TypeScript
- Tailwind CSS v4
- shadcn/ui 风格组件（本地组件实现）
- Cloudflare Workers（OpenNext + Wrangler）

## 功能清单

- 上传 txt/doc/docx/pdf 文件
- 自动解析文本并分段
- 生成总 AIGC 率
- 段落级 AI 疑似率与风险颜色标记
- 报告写入 Worker 内存（演示用途，实例重启后会清空）
- 与内置历史样本 + 近期报告相似度对比
- 文件解析策略：txt/docx/pdf 在浏览器端提取文本后提交，doc 提示先转为 docx
- 相似度逻辑：
  - >= 80%：总 AIGC 率参考历史样本，控制在 ±5% 波动
  - < 80%：总 AIGC 率在 75%~100% 区间偏高生成
- 完整报告页（总览、段落分析、高亮原文、结论、免责声明）

## 本地运行（Next.js）

1. 安装依赖

```bash
npm install
```

1. 启动开发服务器

```bash
npm run dev
```

访问 <http://localhost:3000>

## Cloudflare Worker 运行

1. 安装依赖

```bash
npm install
```

1. 本地 Worker 调试

```bash
npm run cf:dev
```

1. 部署到 Cloudflare Worker

```bash
npm run cf:deploy
```

## 目录结构

```text
app/
  api/analyze/route.ts      # 上传解析 + 检测 + 写入 Worker 内存
  detect/page.tsx           # 检测页
  report/[id]/page.tsx      # 报告页
  about/page.tsx            # 关于页
  page.tsx                  # 首页
components/
  ui/                       # shadcn 风格组件
lib/
  analyzer.ts               # 分段、相似度、伪检测算法
  client-file-parser.ts     # 浏览器侧 txt/docx/pdf 文本提取
  file-parser.ts            # Worker 兜底解析（txt）
  report-store.ts           # Worker 进程内报告存储
wrangler.jsonc              # Cloudflare Worker 配置
```

## 免责声明

本平台为讽刺性艺术项目，旨在批评对 AIGC 检测的技术神化与商业滥用。页面展示的检测结果、风险判定与分析报告均为演示生成内容，不具备任何学术、法律、查重或商业决策效力。
