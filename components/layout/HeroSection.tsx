"use client";

import { useRef } from "react";
import Link from "next/link";
import { FundSearch, FundSearchRef } from "@/components/funds/FundSearch";

export function HeroSection() {
  const fundSearchRef = useRef<FundSearchRef>(null);

  const handleSearchClick = () => {
    fundSearchRef.current?.focus();
  };

  return (
    <section className="border-b-2 border-news-border pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 lg:border-r lg:border-news-border lg:pr-6">
          <div className="mb-4">
            <span className="inline-block bg-finance-rise text-white text-xs font-bold px-3 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3']">
              今日焦点
            </span>
          </div>
          <h2 className="font-['Newsreader'] text-5xl md:text-6xl font-bold text-news-text mb-4 leading-tight">
            追基日报
          </h2>
          <p className="font-['Libre_Baskerville'] text-lg text-news-muted leading-relaxed mb-4">
            实时追踪您的基金投资组合，提供最新的估值数据、重仓分析和组合管理工具。
            让您的投资决策更加明智。
          </p>
          <div className="flex items-center gap-3 text-sm text-news-muted font-['Source_Sans_3']">
            <span>编辑：追基日报编辑部</span>
            <span className="text-news-border">|</span>
            <span>来源：天天基金网</span>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="border-b-2 border-news-text pb-4 mb-4">
            <h3 className="font-['Playfair_Display'] text-xl font-bold text-news-text mb-3">
              快速添加
            </h3>
            <FundSearch ref={fundSearchRef} />
          </div>

          <div className="space-y-3">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] border-b border-news-border pb-2">
              日报导航
            </h4>
            <div className="space-y-3 text-sm">
              <button
                onClick={handleSearchClick}
                className="flex items-start gap-2 w-fit text-left hover:opacity-70 transition-opacity cursor-pointer"
              >
                <span className="text-finance-rise font-bold">▸</span>
                <p className="font-['Libre_Baskerville'] text-news-text">
                  添加基金代码即可查看实时估值
                </p>
              </button>
              <Link
                href="/portfolio"
                className="flex items-start gap-2 hover:opacity-70 transition-opacity w-fit"
              >
                <span className="text-finance-rise font-bold">▸</span>
                <p className="font-['Libre_Baskerville'] text-news-text">
                  使用"基金管理"功能分组管理基金
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
