"use client";

import { FundSearch } from "@/components/funds/FundSearch";
import { ValuationTable } from "@/components/funds/ValuationTable";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 头版头条区域 */}
      <section className="border-b-2 border-[#C9C2B5] pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧主新闻 - 占8列 */}
          <div className="lg:col-span-8 lg:border-r lg:border-[#C9C2B5] lg:pr-6">
            <div className="mb-4">
              <span className="inline-block bg-[#C41E3A] text-white text-xs font-bold px-3 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3']">
                今日焦点
              </span>
            </div>
            <h2 className="font-['Newsreader'] text-5xl md:text-6xl font-bold text-[#2D2A26] mb-4 leading-tight">
              追基日报
            </h2>
            <p className="font-['Libre_Baskerville'] text-lg text-[#6B6560] leading-relaxed mb-4">
              实时追踪您的基金投资组合，提供最新的估值数据、重仓分析和组合管理工具。
              让您的投资决策更加明智。
            </p>
            <div className="flex items-center gap-3 text-sm text-[#6B6560] font-['Source_Sans_3']">
              <span>编辑：追基日报编辑部</span>
              <span className="text-[#C9C2B5]">|</span>
              <span>来源：天天基金网</span>
            </div>
          </div>

          {/* 右侧边栏 - 占4列 */}
          <div className="lg:col-span-4">
            <div className="border-b-2 border-[#2D2A26] pb-4 mb-4">
              <h3 className="font-['Playfair_Display'] text-xl font-bold text-[#2D2A26] mb-3">
                快速操作
              </h3>
              <FundSearch />
            </div>

            {/* 简讯列表 */}
            <div className="space-y-3">
              <h4 className="font-['Source_Sans_3'] text-xs font-bold text-[#C41E3A] uppercase tracking-[0.2em] border-b border-[#C9C2B5] pb-2">
                市场简报
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-[#C41E3A] font-bold">▸</span>
                  <p className="font-['Libre_Baskerville'] text-[#2D2A26]">
                    添加基金代码即可查看实时估值
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C41E3A] font-bold">▸</span>
                  <p className="font-['Libre_Baskerville'] text-[#2D2A26]">
                    点击"重仓追踪"查看基金持仓明细
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#C41E3A] font-bold">▸</span>
                  <p className="font-['Libre_Baskerville'] text-[#2D2A26]">
                    使用"组合管理"功能分类管理基金
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <section>
        <div className="border-b-2 border-[#2D2A26] pb-3 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Newsreader'] text-3xl font-bold text-[#2D2A26]">
              基金估值一览
            </h3>
            <span className="text-xs text-[#6B6560] font-['Source_Sans_3'] uppercase tracking-wider">
              实时数据更新
            </span>
          </div>
        </div>

        <ValuationTable />
      </section>

      {/* 底部分栏 */}
      <section className="border-t-2 border-[#C9C2B5] pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:border-r md:border-[#C9C2B5] md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-[#C41E3A] uppercase tracking-[0.2em] mb-3">
              免责声明
            </h4>
            <p className="text-xs text-[#6B6560] font-['Libre_Baskerville'] leading-relaxed">
              本页面展示的数据仅供参考，不构成投资建议。
              基金投资有风险，入市需谨慎。
            </p>
          </div>
          <div className="md:border-r md:border-[#C9C2B5] md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-[#C41E3A] uppercase tracking-[0.2em] mb-3">
              数据来源
            </h4>
            <p className="text-xs text-[#6B6560] font-['Libre_Baskerville'] leading-relaxed">
              数据来源于天天基金网、东方财富等公开渠道， 仅供参考使用。
            </p>
          </div>
          <div>
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-[#C41E3A] uppercase tracking-[0.2em] mb-3">
              联系我们
            </h4>
            <p className="text-xs text-[#6B6560] font-['Libre_Baskerville'] leading-relaxed">
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

