"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFundsStore } from "@/stores/fundsStore";
import { cn, getChangeColor } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { fetchFundHoldingsByJsonp, Holding } from "@/lib/useFundData";
import { Loading } from "@/components/ui/loading";

interface FundHoldings {
  fundCode: string;
  fundName: string;
  holdings: Holding[];
  hasData: boolean;
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

        if (result && result.holdings.length) {
          results.push({
            fundCode: fund.code,
            fundName: result.fundName || fund.name,
            holdings: result.holdings,
            hasData: result.hasData,
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
      <div className="border-b-2 border-news-text pb-4">
        <div className="flex flex-row items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-finance-rise text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2 w-fit">
              深度分析
            </span>
            <h1 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-news-text">
              重仓股票追踪
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={fetchHoldings}
            disabled={loading}
            className="border-news-text hover:bg-news-text dark:hover:bg-paper-100 hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em] w-fit"
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
        {loading && fundHoldings.length === 0 && (
          <div className="h-64">
            <Loading text="正在加载持仓数据..." />
          </div>
        )}

        {fundHoldings.map((fund) => (
          <div
            key={fund.fundCode}
            className="border border-news-border bg-card"
          >
            {/* 基金标题栏 */}
            <div
              className="border-b-2 border-news-text px-3 sm:px-5 py-3 sm:py-4 cursor-pointer hover:bg-paper-100 dark:hover:bg-paper-600 transition-colors flex items-center justify-between gap-2"
              onClick={() => toggleExpand(fund.fundCode)}
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-news-text dark:bg-paper-500 flex-shrink-0 flex items-center justify-center">
                  <span className="font-['Newsreader'] text-lg sm:text-xl font-bold text-white dark:text-news-text">
                    {fund.fundName.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="font-['Libre_Baskerville'] text-base sm:text-lg font-bold text-news-text truncate">
                    {fund.fundName}
                  </h2>
                  <span className="text-xs text-news-muted font-['JetBrains_Mono']">
                    {fund.fundCode}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {fund.hasData ? (
                  <Badge
                    variant="secondary"
                    className="bg-news-accent border border-news-border text-finance-highlight font-['Source_Sans_3'] text-xs whitespace-nowrap"
                  >
                    {fund.holdings.length}只重仓股
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-paper-200 dark:bg-paper-700 text-news-muted font-['Source_Sans_3'] text-xs whitespace-nowrap"
                  >
                    暂无重仓数据
                  </Badge>
                )}
                {expandedFunds.has(fund.fundCode) ? (
                  <ChevronUp className="w-5 h-5 text-news-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-news-muted" />
                )}
              </div>
            </div>

            {/* 持仓明细表格 */}
            {expandedFunds.has(fund.fundCode) && (
              <div>
                {fund.hasData && fund.holdings.length > 0 ? (
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b border-news-border bg-news-accent">
                        <th className="text-left py-2 px-2 sm:py-3 sm:px-3 font-['Source_Sans_3'] text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-news-text w-[30%]">
                          股票名称
                        </th>
                        <th className="text-right py-2 px-1 sm:py-3 sm:px-3 font-['Source_Sans_3'] text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-news-text ">
                          股票代码
                        </th>
                        <th className="text-right py-2 px-1 sm:py-3 sm:px-3 font-['Source_Sans_3'] text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-news-text ">
                          持仓比例
                        </th>
                        <th className="text-right py-2 px-2 sm:py-3 sm:px-3 font-['Source_Sans_3'] text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-news-text ">
                          今日涨跌
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fund.holdings.map((holding, index) => (
                        <tr
                          key={holding.code}
                          className={`border-b border-paper-300 hover:bg-paper-100 transition-colors ${
                            index % 2 === 0 ? "bg-card" : "bg-paper-100"
                          }`}
                        >
                          <td className="py-2 px-2 sm:py-3 sm:px-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-news-text dark:bg-paper-500 flex-shrink-0 flex items-center justify-center">
                                <span className="font-['Newsreader'] font-bold text-white dark:text-news-text text-[10px] sm:text-xs">
                                  {holding.name.charAt(0)}
                                </span>
                              </div>
                              <span className="font-['Libre_Baskerville'] font-semibold text-news-text text-xs sm:text-sm truncate">
                                {holding.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-1 sm:py-3 sm:px-3 font-['JetBrains_Mono'] text-news-muted text-[10px] sm:text-xs">
                            {holding.code}
                          </td>
                          <td className="text-right py-2 px-1 sm:py-3 sm:px-3">
                            <span className="font-['JetBrains_Mono'] text-finance-highlight text-[10px] sm:text-xs">
                              {holding.ratio}%
                            </span>
                          </td>
                          <td className="text-right py-2 px-2 sm:py-3 sm:px-3">
                            <span
                              className={cn(
                                "font-['JetBrains_Mono'] font-bold flex items-center justify-end gap-0.5 text-[10px] sm:text-xs",
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
                ) : (
                  <div className="py-8 px-4 text-center">
                    <p className="text-news-muted font-['Source_Sans_3'] text-sm">
                      该基金暂无重仓股数据
                    </p>
                    <p className="text-news-muted font-['Source_Sans_3'] text-xs mt-1">
                      可能是新发基金或货币/债券型基金
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {fundHoldings.length === 0 && !loading && (
          <div className="py-12 text-center border-t border-news-border">
            <p className="text-news-muted font-['Libre_Baskerville'] text-lg mb-2">
              暂无持仓数据
            </p>
            <p className="text-sm text-news-muted font-['Source_Sans_3']">
              请先添加自选基金以查看重仓信息
            </p>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="border-t-2 border-news-border pt-4">
        <p className="text-xs text-news-muted font-['Source_Sans_3'] text-center">
          数据仅供参考，持仓信息可能存在延迟
        </p>
      </div>
    </div>
  );
}

