"use client";

import { useRef } from "react";
import Link from "next/link";
import { FundSearch, FundSearchRef } from "@/components/funds/FundSearch";
import { ValuationTable } from "@/components/funds/ValuationTable";

export default function Home() {
  const fundSearchRef = useRef<FundSearchRef>(null);

  const handleSearchClick = () => {
    fundSearchRef.current?.focus();
  };

  return (
    <div className="space-y-8">
      {/* 头版头条区域 */}
      <section className="border-b-2 border-news-border pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧主新闻 - 占8列 */}
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

          {/* 右侧边栏 - 占4列 */}
          <div className="lg:col-span-4">
            <div className="border-b-2 border-news-text pb-4 mb-4">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-news-text mb-3">
                快速操作
              </h3>
              <FundSearch ref={fundSearchRef} />
            </div>

            {/* 日报导航 */}
            <div className="space-y-3">
              <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] border-b border-news-border pb-2">
                日报导航
              </h4>
              <div className="space-y-3 text-sm">
                <button
                  onClick={handleSearchClick}
                  className="flex items-start gap-2 w-full text-left hover:opacity-70 transition-opacity"
                >
                  <span className="text-finance-rise font-bold">▸</span>
                  <p className="font-['Libre_Baskerville'] text-news-text">
                    添加基金代码即可查看实时估值
                  </p>
                </button>
                <Link
                  href="/holdings"
                  className="flex items-start gap-2 hover:opacity-70 transition-opacity"
                >
                  <span className="text-finance-rise font-bold">▸</span>
                  <p className="font-['Libre_Baskerville'] text-news-text">
                    点击"重仓追踪"查看基金持仓明细
                  </p>
                </Link>
                <Link
                  href="/portfolio"
                  className="flex items-start gap-2 hover:opacity-70 transition-opacity"
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

      {/* 主要内容区域 */}
      <section>
        <ValuationTable />
      </section>

      {/* 底部分栏 */}
      <section className="border-t-2 border-news-border pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:border-r md:border-news-border md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              免责声明
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              本页面展示的数据仅供参考，不构成投资建议。
              基金投资有风险，入市需谨慎。
            </p>
          </div>
          <div className="md:border-r md:border-news-border md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              数据来源
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              数据来源于天天基金网、东方财富等公开渠道， 仅供参考使用。
            </p>
          </div>
          <div>
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              联系我们
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              追基日报编辑部
              <br />
              为您提供最及时的基金资讯
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

