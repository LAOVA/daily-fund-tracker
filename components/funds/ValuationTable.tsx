"use client";

import React, {
  useEffect,
  useCallback,
  useState,
  useRef,
  memo,
  Fragment,
} from "react";
import {
  RefreshCw,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronDown,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFundsStore, Fund, FundGroup } from "@/stores/fundsStore";
import { formatNumber, formatPercent, getChangeColor } from "@/lib/utils";
import { fetchMultipleFundData } from "@/lib/useFundData";
import { FundDetailPanel } from "./FundDetailPanel";

// 使用 memo 优化表格行
interface FundTableRowProps {
  fund: Fund;
  index: number;
  isExpanded: boolean;
  onRemove: (code: string) => void;
  onToggle: (code: string) => void;
}

const FundTableRow = memo(function FundTableRow({
  fund,
  index,
  isExpanded,
  onRemove,
  onToggle,
}: FundTableRowProps) {
  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 inline" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 inline" />;
    return <Minus className="w-3 h-3 inline" />;
  };

  return (
    <tr
      className={`border-b border-[#E5E5E5] hover:bg-[#F9F8F6] transition-colors cursor-pointer ${
        index % 2 === 0 ? "bg-white" : "bg-[#FDFCFB]"
      } ${isExpanded ? "bg-[#F5F0E6]" : ""}`}
      onClick={() => onToggle(fund.code)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-[#6B6560]">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <div>
            <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
              {fund.name}
            </div>
            <div className="text-xs text-[#6B6560] font-['JetBrains_Mono'] mt-1">
              {fund.code}
            </div>
          </div>
        </div>
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-[#2D2A26]">
        {fund.previousNetAssetValue
          ? formatNumber(fund.previousNetAssetValue)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-[#2D2A26] font-bold">
        {fund.estimatedNetValue ? formatNumber(fund.estimatedNetValue) : "—"}
      </td>
      <td className="text-right py-4 px-4">
        <span
          className={`font-['JetBrains_Mono'] font-bold flex items-center justify-end gap-1 ${getChangeColor(
            fund.estimatedGrowthRate || 0
          )}`}
        >
          {getChangeIcon(fund.estimatedGrowthRate || 0)}
          {fund.estimatedGrowthRate !== undefined
            ? formatPercent(fund.estimatedGrowthRate)
            : "—"}
        </span>
      </td>
      <td className="text-right py-4 px-4">
        <span
          className={`font-['JetBrains_Mono'] ${getChangeColor(
            fund.yesterdayChange || 0
          )}`}
        >
          {fund.yesterdayChange !== undefined
            ? formatPercent(fund.yesterdayChange)
            : "—"}
        </span>
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-[#6B6560]">
        {fund.lastWeekGrowthRate !== undefined
          ? formatPercent(fund.lastWeekGrowthRate)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-[#6B6560]">
        {fund.lastMonthGrowthRate !== undefined
          ? formatPercent(fund.lastMonthGrowthRate)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-[#6B6560]">
        {fund.thisYearGrowthRate !== undefined
          ? formatPercent(fund.thisYearGrowthRate)
          : "—"}
      </td>
      <td className="text-right py-4 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(fund.code);
          }}
          className="text-[#6B6560] hover:text-[#C41E3A] hover:bg-red-50 h-8 w-8 p-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
});

export function ValuationTable() {
  const { watchlist, groups, updateFund, removeFund } = useFundsStore();
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const fetchingCodesRef = useRef<Set<string>>(new Set());

  const fetchFundData = useCallback(
    async (force = false) => {
      if (watchlist.length === 0) return;

      const codesToFetch = force
        ? watchlist.map((f: Fund) => f.code)
        : watchlist
            .filter(
              (f: Fund) =>
                !f.estimatedNetValue && !fetchingCodesRef.current.has(f.code)
            )
            .map((f: Fund) => f.code);

      if (codesToFetch.length === 0) return;

      codesToFetch.forEach((code: string) =>
        fetchingCodesRef.current.add(code)
      );
      setLoading(true);

      try {
        await fetchMultipleFundData(codesToFetch, (code: string, data: any) => {
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

        setLastUpdate(new Date());
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        codesToFetch.forEach((code: string) =>
          fetchingCodesRef.current.delete(code)
        );
        setLoading(false);
      }
    },
    [watchlist, updateFund]
  );

  useEffect(() => {
    fetchFundData();
  }, []);

  useEffect(() => {
    const hasNewFundWithoutData = watchlist.some(
      (f: Fund) => !f.estimatedNetValue && !fetchingCodesRef.current.has(f.code)
    );
    if (hasNewFundWithoutData && !loading) {
      fetchFundData();
    }
  }, [watchlist.length]);

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedFund((prev) => (prev === code ? null : code));
  }, []);

  const handleRemove = useCallback(
    (code: string) => {
      removeFund(code);
      if (expandedFund === code) {
        setExpandedFund(null);
      }
    },
    [removeFund, expandedFund]
  );

  return (
    <div className="bg-white">
      {/* 表头装饰 */}
      <div className="border-b-2 border-[#2D2A26] pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block bg-[#C41E3A] text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2">
              实时行情
            </span>
            <h3 className="font-['Newsreader'] text-3xl font-bold text-[#2D2A26]">
              基金估值表
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* 分组筛选按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant={selectedGroup === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGroup("all")}
                className={
                  selectedGroup === "all"
                    ? "bg-[#2D2A26] text-white font-['Source_Sans_3'] text-xs"
                    : "border-[#C9C2B5] hover:bg-[#F5F0E6] font-['Source_Sans_3'] text-xs"
                }
              >
                <Folder className="w-3 h-3 mr-1" />
                全部
              </Button>
              {groups.map((group: FundGroup) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGroup(group.id)}
                  className={
                    selectedGroup === group.id
                      ? "bg-[#2D2A26] text-white font-['Source_Sans_3'] text-xs"
                      : "border-[#C9C2B5] hover:bg-[#F5F0E6] font-['Source_Sans_3'] text-xs"
                  }
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {group.name}
                  <span className="ml-1 text-[10px]">
                    ({group.funds.length})
                  </span>
                </Button>
              ))}
            </div>
            {lastUpdate && (
              <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                更新于 {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFundData(true)}
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
      </div>

      {/* 提示信息 */}
      <div className="mb-4 text-sm text-[#6B6560] font-['Source_Sans_3'] flex items-center gap-2">
        <span className="text-[#C41E3A]">💡</span>
        <span>点击任意基金行可查看历史净值走势和重仓股信息</span>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#2D2A26] bg-[#F5F0E6]">
              <th className="text-left py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                基金名称
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                昨日净值
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                估值净值
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                估值涨跌
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                昨日涨幅
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                近一周
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                近一月
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                今年来
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-[#2D2A26] w-16">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {watchlist
              .filter((fund: Fund) => {
                if (selectedGroup === "all") return true;
                const group = groups.find(
                  (g: FundGroup) => g.id === selectedGroup
                );
                return group?.funds.includes(fund.code);
              })
              .map((fund: Fund, index: number) => (
                <Fragment key={fund.code}>
                  <FundTableRow
                    fund={fund}
                    index={index}
                    isExpanded={expandedFund === fund.code}
                    onRemove={handleRemove}
                    onToggle={handleToggleExpand}
                  />
                  {expandedFund === fund.code && (
                    <FundDetailPanel
                      fund={fund}
                      onClose={() => setExpandedFund(null)}
                    />
                  )}
                </Fragment>
              ))}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {watchlist.length === 0 && (
        <div className="py-12 text-center border-t border-[#C9C2B5]">
          <p className="text-[#6B6560] font-['Libre_Baskerville'] text-lg mb-2">
            暂无关注基金
          </p>
          <p className="text-sm text-[#6B6560] font-['Source_Sans_3']">
            请在上方搜索框添加基金代码
          </p>
        </div>
      )}

      {/* 分组筛选空状态 */}
      {watchlist.length > 0 &&
        watchlist.filter((fund: Fund) => {
          if (selectedGroup === "all") return true;
          const group = groups.find((g: FundGroup) => g.id === selectedGroup);
          return group?.funds.includes(fund.code);
        }).length === 0 && (
          <div className="py-12 text-center border-t border-[#C9C2B5]">
            <p className="text-[#6B6560] font-['Libre_Baskerville'] text-lg mb-2">
              该分组暂无基金
            </p>
            <p className="text-sm text-[#6B6560] font-['Source_Sans_3']">
              请切换到其他分组或添加基金到该分组
            </p>
          </div>
        )}

      {/* 表格底部装饰 */}
      {watchlist.length > 0 && (
        <div className="border-t-2 border-[#C9C2B5] mt-4 pt-4">
          <div className="flex items-center justify-between text-xs text-[#6B6560] font-['Source_Sans_3']">
            <span>共 {watchlist.length} 只基金</span>
            <span>数据来源：天天基金网</span>
          </div>
        </div>
      )}
    </div>
  );
}

