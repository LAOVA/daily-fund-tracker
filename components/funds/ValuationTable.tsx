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
  Loader2,
  ChevronRight,
  ChevronDown,
  Folder,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFundsStore, Fund, FundGroup } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import { fetchMultipleFundData } from "@/lib/useFundData";
import { FundDetailPanel } from "./FundDetailPanel";
import { ErrorMessage } from "@/components/ui/error-boundary";

interface FundTableRowProps {
  fund: Fund;
  index: number;
  isExpanded: boolean;
  onToggle: (code: string) => void;
}

const FundTableRow = memo(function FundTableRow({
  fund,
  index,
  isExpanded,
  onToggle,
}: FundTableRowProps) {
  return (
    <tr
      className={`border-b border-paper-300 hover:bg-paper-100 transition-colors cursor-pointer ${
        index % 2 === 0 ? "bg-white" : "bg-paper-100"
      } ${isExpanded ? "bg-news-accent" : ""}`}
      onClick={() => onToggle(fund.code)}
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-news-muted">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
          <div>
            <div className="font-['Libre_Baskerville'] font-bold text-news-text">
              {fund.name}
            </div>
            <div className="text-xs text-news-muted font-['JetBrains_Mono'] mt-1">
              {fund.code}
            </div>
          </div>
        </div>
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-text">
        {fund.previousNetAssetValue
          ? formatCurrency(fund.previousNetAssetValue, false)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-text font-bold">
        {fund.estimatedNetValue
          ? formatCurrency(fund.estimatedNetValue, false)
          : "—"}
      </td>
      <td className="text-right py-4 px-4">
        <span
          className={`font-['JetBrains_Mono'] font-bold ${getChangeColor(
            fund.estimatedGrowthRate || 0
          )}`}
        >
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
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-muted hidden md:table-cell">
        {fund.lastWeekGrowthRate !== undefined
          ? formatPercent(fund.lastWeekGrowthRate)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-muted hidden lg:table-cell">
        {fund.lastMonthGrowthRate !== undefined
          ? formatPercent(fund.lastMonthGrowthRate)
          : "—"}
      </td>
      <td className="text-right py-4 px-4 hidden sm:table-cell">
        {fund.shares &&
        fund.previousNetAssetValue &&
        fund.yesterdayChange !== undefined ? (
          <span
            className={cn(
              "font-['JetBrains_Mono'] font-bold",
              getChangeColor(
                fund.shares *
                  fund.previousNetAssetValue *
                  (fund.yesterdayChange / 100)
              )
            )}
          >
            {formatCurrency(
              fund.shares *
                fund.previousNetAssetValue *
                (fund.yesterdayChange / 100)
            )}
          </span>
        ) : (
          <span className="text-news-muted font-['JetBrains_Mono']">—</span>
        )}
      </td>
      <td className="text-right py-4 px-4 hidden md:table-cell">
        {fund.shares && fund.costPrice && fund.estimatedNetValue ? (
          <div>
            <span
              className={cn(
                "font-['JetBrains_Mono'] font-bold flex items-center justify-end gap-1",
                getChangeColor(
                  fund.shares * (fund.estimatedNetValue - fund.costPrice)
                )
              )}
            >
              {formatCurrency(
                fund.shares * (fund.estimatedNetValue - fund.costPrice)
              )}
            </span>
            <span
              className={cn(
                "text-xs font-['JetBrains_Mono'] block",
                getChangeColor(
                  ((fund.estimatedNetValue - fund.costPrice) / fund.costPrice) *
                    100
                )
              )}
            >
              {formatPercent(
                ((fund.estimatedNetValue - fund.costPrice) / fund.costPrice) *
                  100
              )}
            </span>
          </div>
        ) : (
          <span className="text-news-muted font-['JetBrains_Mono']">—</span>
        )}
      </td>
    </tr>
  );
});

interface FundMobileCardProps {
  fund: Fund;
  isExpanded: boolean;
  onToggle: (code: string) => void;
}

const FundMobileCard = memo(function FundMobileCard({
  fund,
  isExpanded,
  onToggle,
}: FundMobileCardProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />;
    if (value < 0) return <TrendingDown className="w-3 h-3" />;
    return null;
  };

  return (
    <div
      className={`border border-news-border bg-white mb-3 ${
        isExpanded ? "ring-2 ring-news-text" : ""
      }`}
    >
      <div
        className="p-4 cursor-pointer"
        onClick={() => onToggle(fund.code)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="font-['Libre_Baskerville'] font-bold text-news-text truncate">
              {fund.name}
            </div>
            <div className="text-xs text-news-muted font-['JetBrains_Mono']">
              {fund.code}
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {fund.estimatedGrowthRate !== undefined && (
              <span
                className={cn(
                  "font-['JetBrains_Mono'] font-bold text-sm flex items-center gap-1",
                  getChangeColor(fund.estimatedGrowthRate)
                )}
              >
                {getTrendIcon(fund.estimatedGrowthRate)}
                {formatPercent(fund.estimatedGrowthRate)}
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-news-muted ml-1" />
            ) : (
              <ChevronRight className="w-4 h-4 text-news-muted ml-1" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-news-muted font-['Source_Sans_3']">
              估值净值
            </div>
            <div className="font-['JetBrains_Mono'] font-bold text-news-text">
              {fund.estimatedNetValue
                ? formatCurrency(fund.estimatedNetValue, false)
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-news-muted font-['Source_Sans_3']">
              昨日净值
            </div>
            <div className="font-['JetBrains_Mono'] text-news-text">
              {fund.previousNetAssetValue
                ? formatCurrency(fund.previousNetAssetValue, false)
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-news-muted font-['Source_Sans_3']">
              昨日涨幅
            </div>
            <div
              className={cn(
                "font-['JetBrains_Mono']",
                getChangeColor(fund.yesterdayChange || 0)
              )}
            >
              {fund.yesterdayChange !== undefined
                ? formatPercent(fund.yesterdayChange)
                : "—"}
            </div>
          </div>
          {fund.shares && fund.costPrice && fund.estimatedNetValue && (
            <div>
              <div className="text-xs text-news-muted font-['Source_Sans_3']">
                持仓收益
              </div>
              <div
                className={cn(
                  "font-['JetBrains_Mono'] font-bold",
                  getChangeColor(
                    fund.shares * (fund.estimatedNetValue - fund.costPrice)
                  )
                )}
              >
                {formatCurrency(
                  fund.shares * (fund.estimatedNetValue - fund.costPrice)
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export function ValuationTable() {
  const { watchlist, groups, updateFund } = useFundsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const fetchingCodesRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);

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
      setError(null);

      try {
        const results = await fetchMultipleFundData(codesToFetch, (code: string, data: any) => {
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
              updateTime: new Date().toISOString(),
            });
          }
        });

        if (results.size === 0 && codesToFetch.length > 0) {
          setError("获取基金数据失败，请检查网络连接后重试");
        }

        setLastUpdate(new Date());
      } catch (err) {
        console.error("Fetch error:", err);
        setError("网络请求失败，请检查网络连接后重试");
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
    if (!hasInitializedRef.current) {
      fetchFundData();
      hasInitializedRef.current = true;
      return;
    }

    const hasNewFundWithoutData = watchlist.some(
      (f: Fund) => !f.estimatedNetValue && !fetchingCodesRef.current.has(f.code)
    );
    if (hasNewFundWithoutData && !loading) {
      fetchFundData();
    }
  }, [fetchFundData, loading, watchlist]);

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedFund((prev) => (prev === code ? null : code));
  }, []);

  const filteredFunds = watchlist.filter((fund: Fund) => {
    if (selectedGroup === "all") return true;
    const group = groups.find((g: FundGroup) => g.id === selectedGroup);
    return group?.funds.includes(fund.code);
  });

  return (
    <div className="bg-white">
      <div className="border-b-2 border-news-text pb-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="inline-block bg-finance-rise text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2">
              实时行情
            </span>
            <h3 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-news-text">
              基金估值表
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <Button
                variant={selectedGroup === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGroup("all")}
                className={cn(
                  "font-['Source_Sans_3'] text-xs cursor-pointer whitespace-nowrap",
                  selectedGroup === "all"
                    ? "bg-news-text text-white "
                    : "border-news-border hover:bg-news-accent "
                )}
              >
                <Folder className="w-3 h-3 mr-1" />
                全部
              </Button>
              {groups.slice(0, 3).map((group: FundGroup) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGroup(group.id)}
                  className={cn(
                    "font-['Source_Sans_3'] text-xs cursor-pointer whitespace-nowrap",
                    selectedGroup === group.id
                      ? "bg-news-text text-white"
                      : "border-news-border hover:bg-news-accent"
                  )}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {group.name.length > 4 ? group.name.slice(0, 4) + "..." : group.name}
                </Button>
              ))}
            </div>
            {lastUpdate && (
              <span className="text-xs text-news-muted font-['Source_Sans_3'] hidden sm:inline">
                更新于 {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchFundData(true)}
              disabled={loading}
              className="border-news-text hover:bg-news-text hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em] cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-2 hidden sm:inline">刷新</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage
            title="数据加载失败"
            message={error}
            onRetry={() => fetchFundData(true)}
          />
        </div>
      )}

      <div className="mb-4 text-sm text-news-muted font-['Source_Sans_3'] flex items-center gap-2">
        <span className="text-finance-rise">💡</span>
        <span className="hidden sm:inline">点击任意基金行可查看历史净值走势和重仓股信息</span>
        <span className="sm:hidden">点击卡片查看详情</span>
      </div>

      {/* 移动端卡片视图 */}
      <div className="lg:hidden">
        {filteredFunds.map((fund: Fund) => (
          <Fragment key={fund.code}>
            <FundMobileCard
              fund={fund}
              isExpanded={expandedFund === fund.code}
              onToggle={handleToggleExpand}
            />
            {expandedFund === fund.code && (
              <div className="mb-3">
                <FundDetailPanel
                  fund={fund}
                  onClose={() => setExpandedFund(null)}
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-news-text bg-news-accent">
              <th className="text-left py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                基金名称
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                昨日净值
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                估值净值
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                估值涨跌
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                昨日涨幅
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                近一周
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                近一月
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                昨日收益
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                持仓收益
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredFunds.map((fund: Fund, index: number) => (
              <Fragment key={fund.code}>
                <FundTableRow
                  fund={fund}
                  index={index}
                  isExpanded={expandedFund === fund.code}
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
        <div className="py-12 text-center border-t border-news-border">
          <p className="text-news-muted font-['Libre_Baskerville'] text-lg mb-2">
            暂无关注基金
          </p>
          <p className="text-sm text-news-muted font-['Source_Sans_3']">
            请在上方搜索框添加基金代码
          </p>
        </div>
      )}

      {watchlist.length > 0 && filteredFunds.length === 0 && (
          <div className="py-12 text-center border-t border-news-border">
            <p className="text-news-muted font-['Libre_Baskerville'] text-lg mb-2">
              该分组暂无基金
            </p>
            <p className="text-sm text-news-muted font-['Source_Sans_3']">
              请切换到其他分组或添加基金到该分组
            </p>
          </div>
)}

      {watchlist.length > 0 && filteredFunds.length === 0 && (
        <div className="py-12 text-center border-t border-news-border">
          <p className="text-news-muted font-['Libre_Baskerville'] text-lg mb-2">
            该分组暂无基金
          </p>
          <p className="text-sm text-news-muted font-['Source_Sans_3']">
            请切换到其他分组或添加基金到该分组
          </p>
        </div>
      )}

      {watchlist.length > 0 && (
        <div className="border-t-2 border-news-border mt-4 pt-4">
          <div className="flex items-center justify-between text-xs text-news-muted font-['Source_Sans_3']">
            <span>共 {filteredFunds.length} 只基金</span>
            <span className="hidden sm:inline">数据来源：天天基金网</span>
          </div>
        </div>
      )}
    </div>
  );
}

