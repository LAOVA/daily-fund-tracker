"use client";

import { useState } from "react";
import { ValuationTable } from "@/components/funds/ValuationTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useFundsStore, Fund, FundGroup } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import {
  Trash2,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Move,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TransactionManager } from "@/components/funds/TransactionManager";
import { PortfolioAnalysis } from "@/components/analysis/PortfolioAnalysis";
import { ProfitAttribution } from "@/components/analysis/ProfitAttribution";
import { DataImportExport } from "@/components/funds/DataImportExport";
import { DailyProfitCalendar } from "@/components/funds/DailyProfitCalendar";

export default function Home() {
  const {
    watchlist,
    groups,
    addGroup,
    removeGroup,
    removeFund,
    addFundToGroup,
    removeFundFromGroup,
    transactions,
  } = useFundsStore();

  const [newGroupName, setNewGroupName] = useState("");
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [movingFund, setMovingFund] = useState<{
    code: string;
    fromGroupId: string;
  } | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<{ code: string } | null>(null);

  const handleDeleteFund = () => {
    if (fundToDelete) {
      removeFund(fundToDelete.code);
      setFundToDelete(null);
    }
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName("");
      setIsAddGroupOpen(false);
    }
  };

  const getFundByCode = (code: string) => {
    return watchlist.find((f: Fund) => f.code === code);
  };

  const handleMoveFund = (code: string, fromGroupId: string) => {
    setMovingFund({ code, fromGroupId });
    setIsMoveDialogOpen(true);
  };

  const executeMoveFund = (toGroupId: string) => {
    if (movingFund) {
      removeFundFromGroup(movingFund.code, movingFund.fromGroupId);
      addFundToGroup(movingFund.code, toGroupId);
      setMovingFund(null);
      setIsMoveDialogOpen(false);
    }
  };

  const toggleFundExpand = (fundCode: string) => {
    setExpandedFund(expandedFund === fundCode ? null : fundCode);
  };

  const calculateMarketValue = (fund: Fund) => {
    if (fund.shares && fund.estimatedNetValue) {
      return fund.shares * fund.estimatedNetValue;
    }
    return 0;
  };

  const calculateProfit = (fund: Fund) => {
    if (fund.shares && fund.costPrice && fund.estimatedNetValue) {
      return fund.shares * (fund.estimatedNetValue - fund.costPrice);
    }
    return 0;
  };

  const calculateTotalCost = (fund: Fund) => {
    return (fund.shares || 0) * (fund.costPrice || 0);
  };

  const getTransactionCount = (fundCode: string) => {
    return transactions.filter((t) => t.fundCode === fundCode).length;
  };

  const portfolioSummary = watchlist.reduce(
    (acc, fund) => {
      if (fund.shares && fund.costPrice) {
        const marketValue = calculateMarketValue(fund);
        const cost = calculateTotalCost(fund);
        acc.totalMarketValue += marketValue;
        acc.totalCost += cost;
        acc.totalProfit += marketValue - cost;
      }
      return acc;
    },
    { totalMarketValue: 0, totalCost: 0, totalProfit: 0 }
  );

  const totalProfitPercent =
    portfolioSummary.totalCost > 0
      ? (portfolioSummary.totalProfit / portfolioSummary.totalCost) * 100
      : 0;

  return (
    <section>
      <div className="space-y-8 mb-8">
        <div className="border-b-2 border-news-text pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block bg-finance-rise text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2 w-fit">
                投资管理
              </span>
              <h1 className="font-['Newsreader'] text-2xl sm:text-3xl font-bold text-news-text">
                我的基金
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DataImportExport />
              <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="cursor-pointer border-news-text hover:bg-news-text dark:hover:bg-paper-100 hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em] whitespace-nowrap"
                  >
                    <FolderPlus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">新建分组</span>
                    <span className="sm:hidden">分组</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md border-2 border-news-text">
                  <DialogHeader>
                    <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-news-text">
                      新建分组
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 mt-4">
                    <Input
                      placeholder="输入分组名称..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                      className="flex-1 border-news-border"
                    />
                    <Button
                      onClick={handleAddGroup}
                      className="bg-news-text dark:bg-paper-100 hover:bg-paper-900 dark:hover:bg-paper-200"
                    >
                      添加
                    </Button>
                  </div>
                </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={!!fundToDelete}
          onOpenChange={(open) => !open && setFundToDelete(null)}
          title="删除基金"
          description={`确定要删除基金 ${fundToDelete?.code} 吗？此操作不可恢复。`}
          confirmText="删除"
          cancelText="取消"
          onConfirm={handleDeleteFund}
          variant="destructive"
        />
      </div>
          </div>
        </div>

        {portfolioSummary.totalCost > 0 && (
          <div className="bg-news-accent border border-news-border p-6">
            <h2 className="font-['Newsreader'] text-xl font-bold text-news-text mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              投资总览
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-card border border-paper-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-news-text dark:bg-paper-100 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">¥</span>
                  </div>
                  <span className="text-xs text-news-muted font-['Source_Sans_3']">
                    总成本
                  </span>
                </div>
                <div className="font-['JetBrains_Mono'] text-xl font-bold text-news-text">
                  {formatCurrency(portfolioSummary.totalCost)}
                </div>
              </div>
              <div className="bg-card border border-paper-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      portfolioSummary.totalMarketValue >=
                        portfolioSummary.totalCost
                        ? "bg-finance-rise"
                        : "bg-finance-fall"
                    )}
                  >
                    <span className="text-white text-xs font-bold">¥</span>
                  </div>
                  <span className="text-xs text-news-muted font-['Source_Sans_3']">
                    总市值
                  </span>
                </div>
                <div className="font-['JetBrains_Mono'] text-xl font-bold text-news-text">
                  {formatCurrency(portfolioSummary.totalMarketValue)}
                </div>
              </div>
              <div className="bg-card border border-paper-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      portfolioSummary.totalProfit >= 0
                        ? "bg-finance-rise"
                        : "bg-finance-fall"
                    )}
                  >
                    {portfolioSummary.totalProfit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-news-muted font-['Source_Sans_3']">
                    总收益
                  </span>
                </div>
                <div
                  className={cn(
                    "font-['JetBrains_Mono'] text-xl font-bold flex items-center gap-1",
                    getChangeColor(portfolioSummary.totalProfit)
                  )}
                >
                  {formatCurrency(portfolioSummary.totalProfit)}
                </div>
              </div>
              <div className="bg-card border border-paper-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      totalProfitPercent >= 0
                        ? "bg-finance-rise"
                        : "bg-finance-fall"
                    )}
                  >
                    {totalProfitPercent >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-white" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-xs text-news-muted font-['Source_Sans_3']">
                    总收益率
                  </span>
                </div>
                <div
                  className={cn(
                    "font-['JetBrains_Mono'] text-xl font-bold flex items-center gap-1",
                    getChangeColor(totalProfitPercent)
                  )}
                >
                  {formatPercent(Math.abs(totalProfitPercent))}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <DailyProfitCalendar funds={watchlist} />
            </div>
          </div>
        )}

        {portfolioSummary.totalCost > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PortfolioAnalysis />
            <ProfitAttribution />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {groups.map((group: FundGroup) => (
            <div key={group.id} className="border border-news-border bg-card">
              <div className="border-b-2 border-news-text px-5 py-4 flex items-center justify-between bg-news-accent">
                <h2 className="font-['Libre_Baskerville'] text-xl font-bold text-news-text">
                  {group.name}
                </h2>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-card text-finance-highlight font-['Source_Sans_3'] text-xs border border-news-border"
                  >
                    {group.funds.length}只基金
                  </Badge>
                  {group.id !== "default" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                      className="text-news-muted hover:text-finance-rise hover:bg-red-50 dark:hover:bg-red-950 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                {group.funds.map((fundCode: string, index: number) => {
                  const fund = getFundByCode(fundCode);
                  if (!fund) return null;

                  const hasPosition = fund.shares && fund.costPrice;
                  const profit = calculateProfit(fund);
                  const transactionCount = getTransactionCount(fundCode);
                  const isExpanded = expandedFund === fundCode;

                  return (
                    <div key={fundCode}>
                      <div
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-paper-200 transition-colors cursor-pointer ${
                          index !== group.funds.length - 1
                            ? "border-b border-paper-300 "
                            : ""
                        } ${isExpanded ? "bg-paper-200" : ""}`}
                        onClick={() => toggleFundExpand(fundCode)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-news-text dark:bg-paper-500 flex-shrink-0 flex items-center justify-center">
                            <span className="font-['Newsreader'] font-bold text-white text-sm">
                              {fund.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-['Libre_Baskerville'] font-bold text-news-text truncate text-sm sm:text-base">
                              {fund.name}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-news-muted font-['JetBrains_Mono']">
                                {fundCode}
                              </span>
                              <span
                                className={
                                  "font-['JetBrains_Mono'] font-bold text-xs text-finance-neutral"
                                }
                              >
                                {fund.estimatedNetValue
                                  ? formatCurrency(
                                      fund.estimatedNetValue,
                                      false,
                                      4
                                    )
                                  : "—"}
                              </span>
                              {transactionCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-news-accent border-news-border text-news-muted font-['Source_Sans_3'] text-[10px] px-1 py-0"
                                >
                                  {transactionCount} 笔
                                </Badge>
                              )}
                            </div>
                            {hasPosition && (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0 mt-1 text-xs">
                                <span className="text-news-muted font-['JetBrains_Mono']">
                                  {fund.shares?.toFixed(2)}份
                                </span>
                                <span
                                  className={cn(
                                    "font-['JetBrains_Mono'] font-bold",
                                    getChangeColor(profit)
                                  )}
                                >
                                  {formatCurrency(profit)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 mt-2 sm:mt-0">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveFund(fundCode, group.id);
                              }}
                              className="text-news-muted hover:text-news-text hover:bg-gray-100 dark:hover:bg-paper-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                              title="移动到分组"
                            >
                              <Move className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFundToDelete({ code: fundCode });
                              }}
                              className="text-news-muted hover:text-finance-rise hover:bg-red-50 dark:hover:bg-red-950 h-7 w-7 sm:h-8 sm:w-8 p-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-news-muted ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-news-muted ml-1" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 sm:px-4 pb-4 pt-2 bg-paper-200 border-b border-paper-300 space-y-4">
                          <TransactionManager fund={fund} />
                          <DailyProfitCalendar fund={fund} />
                        </div>
                      )}
                    </div>
                  );
                })}

                {group.funds.length === 0 && (
                  <div className="p-8 text-center text-news-muted font-['Source_Sans_3']">
                    该分组暂无基金
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
          <DialogContent className="sm:max-w-md border-2 border-news-text">
            <DialogHeader>
              <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-news-text">
                移动到其他分组
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-news-muted font-['Source_Sans_3'] mb-4">
                选择目标分组：
              </p>
              {groups
                .filter((g) => g.id !== movingFund?.fromGroupId)
                .map((group) => (
                  <Button
                    key={group.id}
                    variant="outline"
                    className="w-news-border hover:bg-full justify-start border-news-accent hover:border-news-text font-['Source_Sans_3']"
                    onClick={() => executeMoveFund(group.id)}
                  >
                    <FolderPlus className="w-4 h-4 mr-2 text-news-muted" />
                    {group.name}
                    <span className="ml-auto text-xs text-news-muted">
                      {group.funds.length}只基金
                    </span>
                  </Button>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ValuationTable />
    </section>
  );
}
