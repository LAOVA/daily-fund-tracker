"use client";

import { useMemo } from "react";
import { useFundsStore } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, cn, getChangeColor } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface ProfitAttributionProps {
  className?: string;
}

export function ProfitAttribution({ className }: ProfitAttributionProps) {
  const { watchlist } = useFundsStore();

  const attributionData = useMemo(() => {
    const fundsWithPosition = watchlist.filter(
      (f) => f.shares && f.costPrice && f.shares > 0 && f.costPrice > 0
    );

    if (fundsWithPosition.length === 0) {
      return null;
    }

    const totalProfit = fundsWithPosition.reduce((sum, f) => {
      const profit = (f.shares || 0) * ((f.estimatedNetValue || 0) - (f.costPrice || 0));
      return sum + profit;
    }, 0);

    const totalCost = fundsWithPosition.reduce(
      (sum, f) => sum + (f.shares || 0) * (f.costPrice || 0),
      0
    );

    const fundAttributions = fundsWithPosition.map((f) => {
      const cost = (f.shares || 0) * (f.costPrice || 0);
      const marketValue = (f.shares || 0) * (f.estimatedNetValue || 0);
      const profit = marketValue - cost;
      const profitPercent = f.costPrice && f.costPrice > 0
        ? ((f.estimatedNetValue || 0) - f.costPrice) / f.costPrice * 100
        : 0;
      const contributionRatio = totalProfit !== 0 ? (profit / totalProfit) * 100 : 0;
      const weightRatio = totalCost > 0 ? (cost / totalCost) * 100 : 0;

      return {
        code: f.code,
        name: f.name,
        cost,
        marketValue,
        profit,
        profitPercent,
        contributionRatio,
        weightRatio,
        shares: f.shares || 0,
        costPrice: f.costPrice || 0,
        currentNetValue: f.estimatedNetValue || 0,
        estimatedGrowthRate: f.estimatedGrowthRate,
      };
    });

    fundAttributions.sort((a, b) => b.profit - a.profit);

    const topGainers = fundAttributions.filter((f) => f.profit > 0).slice(0, 3);
    const topLosers = fundAttributions.filter((f) => f.profit < 0).sort((a, b) => a.profit - b.profit).slice(0, 3);

    return {
      fundAttributions,
      totalProfit,
      totalCost,
      topGainers,
      topLosers,
    };
  }, [watchlist]);

  if (!attributionData) {
    return (
      <div className={cn("bg-card border border-news-border p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-news-muted" />
          <h3 className="font-['Newsreader'] text-xl font-bold text-news-text">
            收益归因
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center text-news-muted font-['Source_Sans_3'] border border-dashed border-news-border rounded-lg">
          请先添加持仓信息以查看收益归因
        </div>
      </div>
    );
  }

  const { fundAttributions, topGainers, topLosers } = attributionData;

  return (
    <div className={cn("bg-card border border-news-border p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-news-muted" />
        <h3 className="font-['Newsreader'] text-xl font-bold text-news-text">
          收益归因
        </h3>
      </div>

      {topGainers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-finance-rise font-['Source_Sans_3'] uppercase tracking-wider mb-3 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            盈利贡献 TOP 3
          </h4>
          <div className="space-y-2">
            {topGainers.map((f, index) => (
              <div
                key={f.code}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-finance-rise rounded flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-['Libre_Baskerville'] font-bold text-news-text text-sm">
                      {f.name}
                    </div>
                    <div className="text-xs text-news-muted font-['JetBrains_Mono']">
                      {f.code} | {f.shares.toFixed(2)}份
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-['JetBrains_Mono'] font-bold text-finance-rise">
                    +{formatCurrency(f.profit, false)}
                  </div>
                  <div className="text-xs text-news-muted">
                    贡献 {f.contributionRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topLosers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-finance-fall font-['Source_Sans_3'] uppercase tracking-wider mb-3 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            亏损贡献 TOP 3
          </h4>
          <div className="space-y-2">
            {topLosers.map((f, index) => (
              <div
                key={f.code}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-finance-fall rounded flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-['Libre_Baskerville'] font-bold text-news-text text-sm">
                      {f.name}
                    </div>
                    <div className="text-xs text-news-muted font-['JetBrains_Mono']">
                      {f.code} | {f.shares.toFixed(2)}份
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-['JetBrains_Mono'] font-bold text-finance-fall">
                    {formatCurrency(f.profit, false)}
                  </div>
                  <div className="text-xs text-news-muted">
                    贡献 {Math.abs(f.contributionRatio).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-news-border pt-4">
        <h4 className="text-xs font-bold text-news-text font-['Source_Sans_3'] uppercase tracking-wider mb-3">
          全部持仓收益
        </h4>
        <div className="space-y-1">
          {fundAttributions.map((f) => (
            <div
              key={f.code}
              className="flex items-center justify-between py-2 px-3 hover:bg-paper-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-1 h-8 rounded-full bg-news-text" />
                <div className="flex-1 min-w-0">
                  <div className="font-['Libre_Baskerville'] text-sm text-news-text truncate">
                    {f.name}
                  </div>
                  <div className="text-xs text-news-muted font-['JetBrains_Mono']">
                    占比 {f.weightRatio.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={cn(
                    "font-['JetBrains_Mono'] font-bold text-sm",
                    getChangeColor(f.profit)
                  )}>
                    {f.profit >= 0 ? "+" : ""}{formatCurrency(f.profit, false)}
                  </div>
                  <div className={cn(
                    "text-xs font-['JetBrains_Mono']",
                    getChangeColor(f.profitPercent)
                  )}>
                    {formatPercent(f.profitPercent)}
                  </div>
                </div>
                {f.estimatedGrowthRate !== undefined && (
                  <div className={cn(
                    "text-xs font-['JetBrains_Mono'] font-bold flex items-center gap-1",
                    getChangeColor(f.estimatedGrowthRate)
                  )}>
                    {f.estimatedGrowthRate > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : f.estimatedGrowthRate < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {formatPercent(f.estimatedGrowthRate)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
