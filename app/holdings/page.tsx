"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFundsStore } from "@/stores/fundsStore";
import { cn, getChangeColor } from "@/lib/utils";
import { ChevronDown, ChevronUp, RefreshCw, Loader2 } from "lucide-react";
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
      // 使用客户端JSONP方式获取持仓数据 - 串行获取避免JSONP回调冲突
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2D2A26] headline-underline">
          重仓股票追踪
        </h1>
        <Button
          variant="outline"
          onClick={fetchHoldings}
          disabled={loading}
          className="border-[#C9C2B5] hover:bg-[#F5F0E6]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2 font-['Source_Sans_3']">刷新</span>
        </Button>
      </div>

      <div className="space-y-4">
        {fundHoldings.map((fund) => (
          <Card
            key={fund.fundCode}
            className="border-3 border-[#C9C2B5] overflow-hidden"
          >
            <CardHeader
              className="border-b-2 border-[#C9C2B5] px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(fund.fundCode)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#2D2A26] flex items-center justify-center">
                    <span className="font-['Playfair_Display'] font-bold text-white">
                      {fund.fundName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="font-['Libre_Baskerville'] text-lg font-bold text-[#2D2A26]">
                      {fund.fundName}
                    </CardTitle>
                    <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                      {fund.fundCode}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F0E6] text-[#8B0000] font-['Source_Sans_3']"
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
            </CardHeader>

            {expandedFunds.has(fund.fundCode) && (
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  {fund.holdings.map((holding) => (
                    <div
                      key={holding.code}
                      className="border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* 整体左右布局 */}
                      <div className="flex items-center justify-between">
                        {/* 左边：股票信息 */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2D2A26] flex items-center justify-center font-['Playfair_Display'] font-bold text-white text-sm">
                            {holding.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                              {holding.name}
                            </div>
                            <div className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                              {holding.code}
                            </div>
                          </div>
                        </div>
                        {/* 右边：持仓比例 + 涨跌幅 */}
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="bg-[#F5F0E6] text-[#8B0000] font-['Source_Sans_3'] text-xs"
                          >
                            持仓 {holding.ratio}%
                          </Badge>
                          <span
                            className={cn(
                              "font-mono text-lg font-bold",
                              getChangeColor(holding.change || 0)
                            )}
                          >
                            {holding.change !== undefined ? (
                              <>
                                {holding.change > 0 ? "+" : ""}
                                {holding.change.toFixed(2)}%
                              </>
                            ) : (
                              "--"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {fundHoldings.length === 0 && !loading && (
          <div className="text-center py-12 text-[#6B6560] font-['Source_Sans_3']">
            暂无持仓数据，请先添加自选基金
          </div>
        )}
      </div>
    </div>
  );
}
