"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  LayoutDashboard,
  PieChart,
  Briefcase,
  Settings,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settingsStore";

const navItems = [
  { href: "/", label: "实时估值", icon: TrendingUp },
  { href: "/holdings", label: "重仓追踪", icon: PieChart },
  { href: "/portfolio", label: "组合管理", icon: Briefcase },
];

export function Header() {
  const pathname = usePathname();
  const { autoRefresh, refreshInterval } = useSettingsStore();

  const today = new Date();
  const dateStr = today
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace("/", "年")
    .replace("/", "月");
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const weekDay = weekDays[today.getDay()];

  return (
    <header className="bg-white border-b-4 border-[#C9C2B5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* 刊头 */}
        <div className="border-b border-[#C9C2B5] mb-3 pb-2">
          <div className="flex items-center justify-between text-xs text-[#6B6560]">
            <span>
              {dateStr} {weekDay}
            </span>
            <span>第{Math.floor(today.getTime() / 86400000 / 7) + 2000}期</span>
            <span>北京 3°C ~ 12°C</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2D2A26] flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display'] font-bold text-2xl text-[#2D2A26] tracking-wide">
                基金估值追踪
              </h1>
              <p className="text-xs text-[#6B6560] tracking-wider font-['Source_Sans_3']">
                FINANCE DAILY
              </p>
            </div>
          </div>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-bold uppercase tracking-wide transition-colors cursor-pointer font-['Source_Sans_3']",
                  pathname === item.href
                    ? "text-[#8B0000] hover:text-[#8B0000]"
                    : "text-[#2D2A26] hover:text-[#8B0000]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 状态指示 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {autoRefresh && (
                <>
                  <RefreshCw className="w-3 h-3 text-[#6B6560] animate-spin-slow" />
                  <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                    {refreshInterval}秒
                  </span>
                </>
              )}
              <span className="w-2 h-2 bg-[#C41E3A] rounded-full live-indicator"></span>
              <span
                className="font-['JetBrains_Mono'] text-sm text-[#6B6560] font-['Source_Sans_3']"
                id="currentTime"
              >
                10:32:45
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
