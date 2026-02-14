"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFundsStore } from "@/stores/fundsStore";
import { cn, getChangeColor } from "@/lib/utils";
import { ChevronDown, ChevronUp, RefreshCw, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fetchFundHoldingsByJsonp, Holding } from "@/lib/useFundData";

interface FundHoldings {
  fundCode: string;
  fundName: string;
  holdings: Holding[];
}

export default function HoldingsPage() {
  const { watchlist } = useFundsStore();
  const [fundHoldings, setFundHoldings] = useState<FundHoldings[]>([]);
  const [expandedFunds, setExpandedFunds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchHoldings = useCallback(async () => {
    if (watchlist.length === 0) return;

    setLoading(true);
    try {
      const results = [];
      for (const fund of watchlist) {
        const result = await fetchFundHoldingsByJsonp(fund.code);
        if (result) {
          results.push({
            fundCode: fund.code,
            fundName: result.fundName || fund.name,
            holdings: result.holdings,
          });
        }
      }
      setFundHoldings(results);
    } catch (error) {
      console.error("Fetch holdings error:", error);
    } finally {
      setLoading(false);
    }
  }, [watchlist]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const toggleExpand = (fundCode: string) => {
    setExpandedFunds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fundCode)) {
        newSet.delete(fundCode);
      } else {
        newSet.add(fundCode);
      }
      return newSet;
    });
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />;
    if (value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="space-y-8">
      {/* 页面标题区 */}
      <div className="border-b-2 border-[#2D2A26] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block bg-[#C41E3A] text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2">
              深度分析
            </span>
            <h1 className="font-['Newsreader'] text-3xl font-bold text-[#2D2A26]">
              重仓股票追踪
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={fetchHoldings}
            disabled={loading}
            className="border-[#2D2A26] hover:bg-[#2D2A26] hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em]"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">刷新</span>
          </Button>
        </div>
      </div>

      {/* 基金持仓列表 */}
      <div className="space-y-6">
        {fundHoldings.map((fund) => (
          <div key={fund.fundCode} className="border border-[#C9C2B5] bg-white">
            {/* 基金标题栏 */}
            <div
              className="border-b-2 border-[#2D2A26] px-5 py-4 cursor-pointer hover:bg-[#F9F8F6] transition-colors flex items-center justify-between"
              onClick={() => toggleExpand(fund.fundCode)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2D2A26] flex items-center justify-center">
                  <span className="font-['Newsreader'] text-xl font-bold text-white">
                    {fund.fundName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="font-['Libre_Baskerville'] text-lg font-bold text-[#2D2A26]">
                    {fund.fundName}
                  </h2>
                  <span className="text-xs text-[#6B6560] font-['JetBrains_Mono']">
                    {fund.fundCode}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-[#F5F0E6] text-[#8B0000] font-['Source_Sans_3'] text-xs"
                >
                  {fund.holdings.length}只重仓股
                </Badge>
                {expandedFunds.has(fund.fundCode) ? (
                  <ChevronUp className="w-5 h-5 text-[#6B6560]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#6B6560]" />
                )}
              </div>
            </div>

            {/* 持仓明细表格 */}
            {expandedFunds.has(fund.fundCode) && (
              <div className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#C9C2B5] bg-[#F5F0E6]">
                      <th className="text-left py-3 px-5 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                        股票名称
                      </th>
                      <th className="text-right py-3 px-5 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                        股票代码
                      </th>
                      <th className="text-right py-3 px-5 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                        持仓比例
                      </th>
                      <th className="text-right py-3 px-5 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                        今日涨跌
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fund.holdings.map((holding, index) => (
                      <tr
                        key={holding.code}
                        className={`border-b border-[#E5E5E5] hover:bg-[#F9F8F6] transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        }`}
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#2D2A26] flex items-center justify-center">
                              <span className="font-['Newsreader'] font-bold text-white text-sm">
                                {holding.name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                              {holding.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-5 font-['JetBrains_Mono'] text-[#6B6560]">
                          {holding.code}
                        </td>
                        <td className="text-right py-3 px-5">
                          <span className="font-['JetBrains_Mono'] text-[#8B0000]">
                            {holding.ratio}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-5">
                          <span
                            className={cn(
                              "font-['JetBrains_Mono'] font-bold flex items-center justify-end gap-1",
                              getChangeColor(holding.change || 0)
                            )}
                          >
                            {getChangeIcon(holding.change || 0)}
                            {holding.change !== undefined ? (
                              <>
                                {holding.change > 0 ? "+" : ""}
                                {holding.change.toFixed(2)}%
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {fundHoldings.length === 0 && !loading && (
          <div className="py-12 text-center border-t border-[#C9C2B5]">
            <p className="text-[#6B6560] font-['Libre_Baskerville'] text-lg mb-2">
              暂无持仓数据
            </p>
            <p className="text-sm text-[#6B6560] font-['Source_Sans_3']">
              请先添加自选基金以查看重仓信息
            </p>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="border-t-2 border-[#C9C2B5] pt-4">
        <p className="text-xs text-[#6B6560] font-['Source_Sans_3'] text-center">
          数据仅供参考，持仓信息可能存在延迟
        </p>
      </div>
    </div>
  );
}
