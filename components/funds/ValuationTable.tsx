"use client";

import {
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
import { useFundsStore, Fund, FundGroup, NavRecord } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import { fetchMultipleFundData } from "@/lib/useFundData";
import { FundDetailPanel } from "./FundDetailPanel";

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
  const todayEarnings =
    fund.shares &&
    fund.previousNetAssetValue &&
    fund.estimatedGrowthRate !== undefined
      ? fund.shares *
        fund.previousNetAssetValue *
        (fund.estimatedGrowthRate / 100)
      : null;

  return (
    <tr
      className={`border-b border-paper-300 hover:bg-paper-200 transition-colors cursor-pointer bg-card ${
        isExpanded ? "bg-paper-200" : ""
      }`}
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
      <td className="text-right py-4 px-4">
        {todayEarnings !== null ? (
          <span
            className={cn(
              "font-['JetBrains_Mono'] font-bold",
              getChangeColor(todayEarnings)
            )}
          >
            {formatCurrency(todayEarnings)}
          </span>
        ) : (
          <span className="text-news-muted font-['JetBrains_Mono']">—</span>
        )}
      </td>
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-text font-bold">
        {fund.estimatedNetValue
          ? formatCurrency(fund.estimatedNetValue, false, 4)
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
      <td className="text-right py-4 px-4 font-['JetBrains_Mono'] text-news-text">
        {fund.previousNetAssetValue
          ? formatCurrency(fund.previousNetAssetValue, false, 4)
          : "—"}
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
      className={`border border-news-border bg-card mb-3 ${
        isExpanded ? "ring-2 ring-news-text" : ""
      }`}
    >
      <div className="p-4 cursor-pointer" onClick={() => onToggle(fund.code)}>
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
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const fetchingCodesRef = useRef<Set<string>>(new Set());
  const hasCleanedRef = useRef(false);

  const fetchFundData = useCallback(async () => {
    setLoading(true);

    if (watchlist.length === 0) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return;
    }

    const now = Date.now();
    const codesToFetch = watchlist
      .filter((f: Fund) => {
        if (!f.updateTime) return true;
        const updateTime = new Date(f.updateTime).getTime();
        const halfMinutes = 0.5 * 60 * 1000;
        return now - updateTime > halfMinutes;
      })
      .map((f: Fund) => f.code);

    if (codesToFetch.length === 0) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      return;
    }

    codesToFetch.forEach((code: string) => fetchingCodesRef.current.add(code));

    try {
      await fetchMultipleFundData(codesToFetch, (code: string, data: any) => {
        const fund = watchlist.find((f: Fund) => f.code === code);
        if (fund && data) {
          console.log(data);

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
            navHistory: data.navHistory as NavRecord[],
          });
        }
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      codesToFetch.forEach((code: string) =>
        fetchingCodesRef.current.delete(code)
      );
      setLoading(false);
    }
  }, [watchlist, updateFund]);

  useEffect(() => {
    if (!hasCleanedRef.current) {
      const { cleanOrphanFunds } = useFundsStore.getState();
      cleanOrphanFunds();
      hasCleanedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (watchlist.length > 0 && !loading) {
      fetchFundData();
    }
  }, [watchlist.length]);

  const handleToggleExpand = useCallback((code: string) => {
    setExpandedFund((prev) => (prev === code ? null : code));
  }, []);

  const filteredFunds = watchlist.filter((fund: Fund) => {
    if (selectedGroup === "all") return true;
    const group = groups.find((g: FundGroup) => g.id === selectedGroup);
    return group?.funds.includes(fund.code);
  });

  return (
    <div>
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
                    ? "bg-news-text dark:bg-paper-400 text-white "
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
                      ? "bg-news-text dark:bg-paper-400 text-white"
                      : "border-news-border hover:bg-news-accent"
                  )}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {group.name.length > 4
                    ? group.name.slice(0, 4) + "..."
                    : group.name}
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
              onClick={() => fetchFundData()}
              disabled={loading}
              className="border-news-text hover:bg-news-text dark:hover:bg-paper-100 hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em] cursor-pointer"
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

      {/* <div className="mb-4 text-sm text-news-muted font-['Source_Sans_3'] flex items-center gap-2">
        <span className="text-finance-rise">💡</span>
        <span className="hidden sm:inline">
          点击任意基金行可查看历史净值走势和重仓股信息
        </span>
        <span className="sm:hidden">点击卡片查看详情</span>
      </div> */}

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
              <FundDetailPanel
                fund={fund}
                onClose={() => setExpandedFund(null)}
                variant="card"
              />
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
                今日收益
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                估值净值
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                估值涨跌
              </th>
              <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text">
                昨日净值
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

      {/* {watchlist.length > 0 && (
        <div className="border-t-2 border-news-border mt-4 pt-4">
          <div className="flex items-center justify-between text-xs text-news-muted font-['Source_Sans_3']">
            <span>共 {filteredFunds.length} 只基金</span>
            <span className="hidden sm:inline">数据来源：天天基金网</span>
          </div>
        </div>
      )} */}
    </div>
  );
}

