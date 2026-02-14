"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFundsStore, Fund } from "@/stores/fundsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatNumber, formatPercent, getChangeColor, cn } from "@/lib/utils";
import { fetchFullFundData } from "@/lib/useFundData";

export function ValuationTable() {
  const router = useRouter();
  const { watchlist, updateFund, removeFund } = useFundsStore();
  const { autoRefresh, refreshInterval } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchFundData = useCallback(async () => {
    console.log(
      "fetchFundData called, watchlist length:",
      watchlist.length,
      watchlist
    );
    if (watchlist.length === 0) return;

    setLoading(true);
    try {
      // 使用客户端直接获取完整数据 - 串行获取避免JSONP回调冲突
      for (const fund of watchlist) {
        console.log("开始获取:", fund.code);
        const data = await fetchFullFundData(fund.code);
        console.log("获取完成:", fund.code, data);
        updateFund(fund.code, {
          code: data.code,
          name: data.name || fund.name,
          previousNetAssetValue: data.previousNetAssetValue,
          estimatedNetValue: data.estimatedNetValue,
          estimatedGrowthRate: data.estimatedGrowthRate,
          yesterdayChange: data.yesterdayChange,
          lastWeekGrowthRate: data.lastWeekChange,
          lastMonthGrowthRate: data.lastMonthChange,
          thisYearGrowthRate: data.thisYearChange,
          updateTime: new Date().toISOString(),
        });
        console.log("更新完成:", fund.code);
      }
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [watchlist, updateFund]);

  // 定时刷新逻辑 - watchlist变化时或定时触发
  useEffect(() => {
    console.log("useEffect triggered, watchlist:", watchlist.length);
    if (watchlist.length > 0) {
      fetchFundData();
    }
  }, [watchlist.length]);

  // 单独的定时器 effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (autoRefresh && refreshInterval > 0) {
      interval = setInterval(() => {
        console.log("定时刷新触发");
        if (watchlist.length > 0) {
          fetchFundData();
        }
      }, refreshInterval * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, watchlist.length]);

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 inline" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 inline" />;
    return <Minus className="w-3 h-3 inline" />;
  };

  return (
    <div className="bg-white border-3 border-[#C9C2B5]">
      <div className="border-b-2 border-[#C9C2B5] px-5 py-4 flex items-center justify-between">
        <h3 className="font-['Playfair_Display'] text-2xl font-bold text-[#2D2A26] headline-underline inline-block">
          实时基金估值
        </h3>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
              更新: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFundData}
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
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-[#F5F0E6] border-b-2 border-[#C9C2B5]">
            <TableHead className="font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              基金名称
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              昨日净值
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              估值净值
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              估值涨跌幅
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              昨日涨幅
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              近一周
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              近一月
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              今年来
            </TableHead>
            <TableHead className="text-right font-['Source_Sans_3'] text-sm font-bold text-[#2D2A26] uppercase tracking-wider">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((fund) => (
            <TableRow
              key={fund.code}
              className="border-b border-[#E5E5E5] hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => router.push(`/holdings?fund=${fund.code}`)}
            >
              <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26] text-lg flex items-center gap-2">
                  {fund.name}
                  <ExternalLink className="w-3 h-3 text-[#6B6560]" />
                </div>
                <div className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                  {fund.code}
                </div>
              </TableCell>
              {/* 昨日净值 */}
              <TableCell className="text-right py-4">
                <span className="font-['JetBrains_Mono'] text-lg text-[#2D2A26] font-bold">
                  {fund.previousNetAssetValue
                    ? formatNumber(fund.previousNetAssetValue)
                    : "--"}
                </span>
              </TableCell>
              {/* 估值净值 */}
              <TableCell className="text-right py-4">
                <span className="font-['JetBrains_Mono'] text-lg text-[#2D2A26] font-bold">
                  {fund.estimatedNetValue
                    ? formatNumber(fund.estimatedNetValue)
                    : "--"}
                </span>
              </TableCell>
              {/* 估值涨跌幅 */}
              <TableCell className="text-right py-4">
                <span
                  className={cn(
                    "font-mono text-lg font-bold flex items-center justify-end gap-1",
                    getChangeColor(fund.estimatedGrowthRate || 0)
                  )}
                >
                  {getChangeIcon(fund.estimatedGrowthRate || 0)}
                  {fund.estimatedGrowthRate !== undefined
                    ? formatPercent(fund.estimatedGrowthRate)
                    : "--"}
                </span>
              </TableCell>
              {/* 昨日涨幅 */}
              <TableCell className="text-right py-4">
                <span
                  className={cn(
                    "font-mono text-lg font-bold flex items-center justify-end gap-1",
                    getChangeColor(fund.yesterdayChange || 0)
                  )}
                >
                  {getChangeIcon(fund.yesterdayChange || 0)}
                  {fund.yesterdayChange !== undefined
                    ? formatPercent(fund.yesterdayChange)
                    : "--"}
                </span>
              </TableCell>
              <TableCell className="text-right py-4">
                <span
                  className={cn(
                    "font-mono font-semibold",
                    getChangeColor(fund.lastWeekGrowthRate || 0)
                  )}
                >
                  {fund.lastWeekGrowthRate !== undefined
                    ? formatPercent(fund.lastWeekGrowthRate)
                    : "--"}
                </span>
              </TableCell>
              <TableCell className="text-right py-4">
                <span
                  className={cn(
                    "font-mono font-semibold",
                    getChangeColor(fund.lastMonthGrowthRate || 0)
                  )}
                >
                  {fund.lastMonthGrowthRate !== undefined
                    ? formatPercent(fund.lastMonthGrowthRate)
                    : "--"}
                </span>
              </TableCell>
              <TableCell className="text-right py-4">
                <span
                  className={cn(
                    "font-mono font-semibold",
                    getChangeColor(fund.thisYearGrowthRate || 0)
                  )}
                >
                  {fund.thisYearGrowthRate !== undefined
                    ? formatPercent(fund.thisYearGrowthRate)
                    : "--"}
                </span>
              </TableCell>
              <TableCell className="text-right py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFund(fund.code);
                  }}
                  className="text-[#6B6560] hover:text-[#C41E3A] hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {watchlist.length === 0 && (
        <div className="p-8 text-center text-[#6B6560] font-['Source_Sans_3']">
          暂无自选基金，请搜索添加
        </div>
      )}
    </div>
  );
}
