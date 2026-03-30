import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "AIGC 论文检测神谕系统",
  description:
    "讽刺性概念站点：模拟主流检测平台，展示“用 AI 检测 AI、再用 AI 降 AI 率”的荒诞逻辑。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="border-t border-black/20 bg-white py-4 text-center text-xs text-black/70">
          Satirical Project Only · 本站所有检测结果均为讽刺性演示生成
        </footer>
      </body>
    </html>
  );
}
