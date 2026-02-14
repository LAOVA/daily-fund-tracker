"use client";

import { useEffect, useCallback, useState, useRef, memo } from "react";
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
import { formatNumber, formatPercent, getChangeColor, cn } from "@/lib/utils";
import { fetchMultipleFundData } from "@/lib/useFundData";

// 使用 memo 优化表格行，避免不必要的重渲染
const FundTableRow = memo(function FundTableRow({
  fund,
  onRemove,
  onNavigate,
}: {
  fund: Fund;
  onRemove: (code: string) => void;
  onNavigate: (code: string) => void;
}) {
  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 inline" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 inline" />;
    return <Minus className="w-3 h-3 inline" />;
  };

  return (
    <TableRow
      className="border-b border-[#E5E5E5] hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onNavigate(fund.code)}
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
      <TableCell className="text-right py-4">
        <span className="font-['JetBrains_Mono'] text-lg text-[#2D2A26] font-bold">
          {fund.previousNetAssetValue
            ? formatNumber(fund.previousNetAssetValue)
            : "--"}
        </span>
      </TableCell>
      <TableCell className="text-right py-4">
        <span className="font-['JetBrains_Mono'] text-lg text-[#2D2A26] font-bold">
          {fund.estimatedNetValue
            ? formatNumber(fund.estimatedNetValue)
            : "--"}
        </span>
      </TableCell>
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
            onRemove(fund.code);
          }}
          className="text-[#6B6560] hover:text-[#C41E3A] hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

export function ValuationTable() {
  const router = useRouter();
  const { watchlist, updateFund, removeFund } = useFundsStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // 使用 ref 跟踪正在获取的基金，避免重复请求
  const fetchingCodesRef = useRef<Set<string>>(new Set());
  
  // 获取基金数据 - 使用批量并行获取
  const fetchFundData = useCallback(async (force = false) => {
    if (watchlist.length === 0) return;

    // 如果不是强制刷新，过滤掉已经在获取中的基金
    const codesToFetch = force
      ? watchlist.map((f: Fund) => f.code)
      : watchlist
          .filter((f: Fund) => !f.estimatedNetValue && !fetchingCodesRef.current.has(f.code))
          .map((f: Fund) => f.code);

    if (codesToFetch.length === 0) {
      console.log("没有需要获取数据的基金");
      return;
    }

    // 标记这些基金正在获取中
    codesToFetch.forEach((code: string) => fetchingCodesRef.current.add(code));

    setLoading(true);
    try {
      console.log("批量获取基金数据:", codesToFetch);
      
      // 使用批量并行获取
      const results = await fetchMultipleFundData(codesToFetch, (code: string, data: any) => {
        // 逐个更新，避免一次性更新导致的大面积重渲染
        const fund = watchlist.find((f: Fund) => f.code === code);
        if (fund && data) {
          updateFund(code, {
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
        }
      });

      console.log("批量获取完成，成功:", results.size, "/", codesToFetch.length);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      // 清除标记
      codesToFetch.forEach((code: string) => fetchingCodesRef.current.delete(code));
      setLoading(false);
    }
  }, [watchlist, updateFund]);

  // 只在组件挂载和 watchlist 长度变化时获取数据
  useEffect(() => {
    fetchFundData();
  }, []); // 只在挂载时执行

  // 监听 watchlist 变化，获取新添加基金的数据
  useEffect(() => {
    const hasNewFundWithoutData = watchlist.some(
      (f: Fund) => !f.estimatedNetValue && !fetchingCodesRef.current.has(f.code)
    );
    
    if (hasNewFundWithoutData && !loading) {
      fetchFundData();
    }
  }, [watchlist.length]); // 只在长度变化时执行

  const handleNavigate = useCallback((code: string) => {
    router.push(`/holdings?fund=${code}`);
  }, [router]);

  const handleRemove = useCallback((code: string) => {
    removeFund(code);
  }, [removeFund]);

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
            onClick={() => fetchFundData(true)}
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
          {watchlist.map((fund: Fund) => (
            <FundTableRow
              key={fund.code}
              fund={fund}
              onRemove={handleRemove}
              onNavigate={handleNavigate}
            />
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
