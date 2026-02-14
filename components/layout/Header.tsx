"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/holdings", label: "重仓追踪" },
  { href: "/portfolio", label: "组合管理" },
];

export function Header() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

  // 计算期号：从2024年1月1日开始计算
  const startDate = new Date("2024-01-01");
  const daysDiff = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const issueNumber = daysDiff + 1;

  return (
    <header className="bg-[#FFFEFB] border-b-2 border-[#C9C2B5]">
      {/* 顶部信息栏 */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-[#6B6560] border-b border-[#C9C2B5] pb-2 mb-4">
          <div className="flex items-center gap-4">
            <span className="font-['Source_Sans_3']">
              {dateStr} {weekDay}
            </span>
            <span className="text-[#C41E3A] font-['JetBrains_Mono'] font-bold">
              第 {issueNumber} 期
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-['Source_Sans_3']">农历甲辰年</span>
            <span className="font-['JetBrains_Mono']">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* 报头 */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="text-center border-b-4 border-[#2D2A26] pb-4 mb-4">
          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[2px] w-32 bg-[#2D2A26]"></div>
            <div className="h-[1px] w-20 bg-[#C9C2B5]"></div>
            <div className="h-[2px] w-32 bg-[#2D2A26]"></div>
          </div>

          {/* 主标题 - 使用 Newsreader 字体 */}
          <h1 className="font-['Newsreader'] text-6xl md:text-7xl font-bold text-[#2D2A26] tracking-wide mb-2">
            追基日报
          </h1>

          {/* 副标题 */}
          <p className="font-['Source_Sans_3'] text-sm text-[#6B6560] tracking-[0.4em] uppercase">
            Daily Fund Tracker
          </p>

          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[2px] w-32 bg-[#2D2A26]"></div>
            <div className="h-[1px] w-20 bg-[#C9C2B5]"></div>
            <div className="h-[2px] w-32 bg-[#2D2A26]"></div>
          </div>
        </div>

        {/* 导航栏 */}
        <nav className="flex items-center justify-center gap-8 border-b border-[#2D2A26] pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.2em]
                transition-all duration-200 hover:scale-105
                ${
                  pathname === item.href
                    ? "text-[#C41E3A] border-b-2 border-[#C41E3A] pb-1"
                    : "text-[#2D2A26] hover:text-[#C41E3A]"
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

