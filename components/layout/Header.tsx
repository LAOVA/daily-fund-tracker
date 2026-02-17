"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/holdings", label: "重仓追踪" },
  { href: "/portfolio", label: "基金管理" },
];

// 创建时间 store
function createTimeStore() {
  let listeners: (() => void)[] = [];
  let currentTime = "";
  let timer: NodeJS.Timeout | null = null;

  function getCurrentTime() {
    return new Date().toLocaleTimeString("zh-CN", { hour12: false });
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
    // 第一次订阅时启动定时器
    if (timer === null) {
      currentTime = getCurrentTime();
      timer = setInterval(() => {
        currentTime = getCurrentTime();
        listeners.forEach((l) => l());
      }, 1000);
    }
    return () => {
      listeners = listeners.filter((l) => l !== listener);
      // 没有订阅者时清理定时器
      if (listeners.length === 0 && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
  }

  function getSnapshot() {
    return currentTime;
  }

  function getServerSnapshot() {
    return "";
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

const timeStore = createTimeStore();

export function Header() {
  const pathname = usePathname();
  const currentTime = useSyncExternalStore(
    timeStore.subscribe,
    timeStore.getSnapshot,
    timeStore.getServerSnapshot
  );

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
  const startDate = new Date("2026-01-01");
  const daysDiff = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const issueNumber = daysDiff + 1;

  return (
    <header className="bg-news-bg border-b-2 border-news-border">
      {/* 顶部信息栏 */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between text-xs text-news-muted border-b border-news-border pb-2 mb-4">
          <div className="flex items-center gap-4">
            <span className="font-['Source_Sans_3']">
              {dateStr} {weekDay}
            </span>
            <span className="text-finance-rise font-['JetBrains_Mono'] font-bold">
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
        <div className="text-center border-b-4 border-news-text pb-4 mb-4">
          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="h-[2px] w-32 bg-news-text"></div>
            <div className="h-[1px] w-20 bg-news-border"></div>
            <div className="h-[2px] w-32 bg-news-text"></div>
          </div>

          {/* 主标题 - 使用 Newsreader 字体 */}
          <h1 className="font-['Newsreader'] text-6xl md:text-7xl font-bold text-news-text tracking-wide ">
            追基日报
          </h1>

          {/* 副标题 */}
          <p className="font-['Source_Sans_3'] text-sm text-news-muted tracking-[0.4em] uppercase">
            Daily Fund Tracker
          </p>

          {/* 报纸装饰线 */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="h-[2px] w-32 bg-news-text"></div>
            <div className="h-[1px] w-20 bg-news-border"></div>
            <div className="h-[2px] w-32 bg-news-text"></div>
          </div>
        </div>

        {/* 导航栏 */}
        <nav className="flex items-center justify-center gap-8 border-b border-news-text pb-3 min-h-[3rem]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.2em]
                transition-all duration-200 hover:scale-105
                ${
                  pathname === item.href
                    ? "text-finance-rise border-b-2 border-finance-rise pb-1"
                    : "text-news-text hover:text-finance-rise"
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

