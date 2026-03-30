import Link from "next/link";
import { Bot, FileSearch, ShieldAlert } from "lucide-react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/detect", label: "开始检测" },
  { href: "/about", label: "关于项目" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="rounded-md border border-white/25 bg-black p-2 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none tracking-wide">
              AIGC 神谕检测中心
            </p>
            <p className="font-mono text-[10px] text-white/70">v4.0 SATIRE</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 text-xs text-white/70 md:flex">
          <ShieldAlert className="h-4 w-4 text-white" />
          <span>学术迷信风控中</span>
          <FileSearch className="h-4 w-4 text-white" />
        </div>
      </div>
    </header>
  );
}
