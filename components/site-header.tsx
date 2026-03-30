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
              论文AIGC率检测中心
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

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/makuralymi/FXXK-satire-aigc-site.git"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/20"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4 fill-current"
            >
              <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.51 2.87 8.34 6.84 9.69.5.1.68-.22.68-.49 0-.24-.01-1.03-.01-1.87-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.57 2.35 1.12 2.92.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.75 1.04A9.2 9.2 0 0 1 12 6.84c.85 0 1.71.12 2.52.36 1.91-1.32 2.75-1.04 2.75-1.04.55 1.43.2 2.48.1 2.74.64.71 1.03 1.62 1.03 2.74 0 3.93-2.35 4.79-4.59 5.04.36.32.69.95.69 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.24 10.24 0 0 0 22 12.23C22 6.58 17.52 2 12 2z" />
            </svg>
            <span className="hidden sm:inline">项目入口</span>
          </a>

          <div className="hidden items-center gap-2 text-xs text-white/70 md:flex">
            <ShieldAlert className="h-4 w-4 text-white" />
            <span>学术迷信风控中</span>
            <FileSearch className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
