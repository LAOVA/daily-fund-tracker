"use client";

import { FundSearch } from "@/components/funds/FundSearch";
import { ValuationTable } from "@/components/funds/ValuationTable";

export default function Home() {
  return (
    <div className="space-y-6">
      {/* 重要新闻头条 */}
      <section className="mb-8">
        <div className="bg-white news-border p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="kicker text-[#8B0000] bg-[#F5F0E6] px-3 py-1">
              市场要闻
            </span>
            <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
          </div>
          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-[#2D2A26] mb-4 leading-tight headline-underline">
            暂无新闻数据
          </h2>
          <p className="font-['Libre_Baskerville'] text-lg text-[#2D2A26] leading-relaxed">
            请搜索并添加基金以查看实时估值数据
          </p>
        </div>
      </section>

      {/* 主体网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基金估值 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 搜索和估值表格 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FundSearch />
            </div>
            <ValuationTable />
          </div>
        </div>

        {/* 右侧：预留 */}
        <div className="space-y-6">
          {/* 可在此处添加其他功能 */}
        </div>
      </div>
    </div>
  );
}

