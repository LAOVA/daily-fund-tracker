"use client";

import { useState } from "react";
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
import { useFundsStore, Fund, FundGroup } from "@/stores/fundsStore";
import { formatCurrency, formatPercent, getChangeColor, cn } from "@/lib/utils";
import {
  Trash2,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Move,
  Wallet,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";
import { TransactionManager } from "@/components/funds/TransactionManager";
import { PortfolioAnalysis } from "@/components/analysis/PortfolioAnalysis";
import { ProfitAttribution } from "@/components/analysis/ProfitAttribution";
import { DataImportExport } from "@/components/funds/DataImportExport";

export default function PortfolioPage() {
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

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />;
    if (value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
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

  const calculateProfitPercent = (fund: Fund) => {
    if (fund.costPrice && fund.estimatedNetValue && fund.costPrice > 0) {
      return ((fund.estimatedNetValue - fund.costPrice) / fund.costPrice) * 100;
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
    <div className="space-y-8">
      <div className="border-b-2 border-news-text pb-4">
        <div className="flex flex-col">
          <span className="inline-block bg-finance-rise text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2 w-fit">
            投资管理
          </span>
          <div className="flex items-center gap-2">
            <h1 className="font-['Newsreader'] text-3xl font-bold text-news-text mr-auto">
              基金管理
            </h1>
            <DataImportExport />
            <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-news-text hover:bg-news-text hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em]"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  新建分组
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
                    className="bg-news-text hover:bg-paper-900"
                  >
                    添加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {portfolioSummary.totalCost > 0 && (
        <div className="bg-news-accent border border-news-border p-6">
          <h2 className="font-['Newsreader'] text-xl font-bold text-news-text mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            投资组合总览
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-paper-300 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-news-text flex items-center justify-center">
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
            <div className="bg-white border border-paper-300 rounded-lg p-4">
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
            <div className="bg-white border border-paper-300 rounded-lg p-4">
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
            <div className="bg-white border border-paper-300 rounded-lg p-4">
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
          <div key={group.id} className="border border-news-border bg-white">
            <div className="border-b-2 border-news-text px-5 py-4 flex items-center justify-between bg-news-accent">
              <h2 className="font-['Libre_Baskerville'] text-xl font-bold text-news-text">
                {group.name}
              </h2>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-white text-finance-highlight font-['Source_Sans_3'] text-xs border border-news-border"
                >
                  {group.funds.length}只基金
                </Badge>
                {group.id !== "default" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGroup(group.id)}
                    className="text-news-muted hover:text-finance-rise hover:bg-red-50 h-8 w-8 p-0"
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
                const profitPercent = calculateProfitPercent(fund);
                const transactionCount = getTransactionCount(fundCode);
                const isExpanded = expandedFund === fundCode;

                return (
                  <div key={fundCode}>
                    <div
                      className={`flex items-center justify-between p-4 hover:bg-paper-100 transition-colors cursor-pointer ${
                        index !== group.funds.length - 1 || isExpanded
                          ? "border-b border-paper-300"
                          : ""
                      }`}
                      onClick={() => toggleFundExpand(fundCode)}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-news-text flex items-center justify-center">
                          <span className="font-['Newsreader'] font-bold text-white text-sm">
                            {fund.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-['Libre_Baskerville'] font-bold text-news-text truncate">
                            {fund.name}
                          </div>
                          <span className="text-xs text-news-muted font-['JetBrains_Mono']">
                            {fundCode}
                          </span>
                          {hasPosition && (
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="text-news-muted font-['JetBrains_Mono']">
                                {fund.shares?.toFixed(2)}份
                              </span>
                              <span className="text-news-muted">|</span>
                              <span
                                className={cn(
                                  "font-['JetBrains_Mono'] font-bold flex items-center gap-1",
                                  getChangeColor(profit)
                                )}
                              >
                                {formatCurrency(profit)}
                              </span>
                              <span
                                className={cn(
                                  "font-['JetBrains_Mono']",
                                  getChangeColor(profitPercent)
                                )}
                              >
                                ({formatPercent(profitPercent)})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* {fund.estimatedGrowthRate !== undefined && (
                          <span
                            className={`font-['JetBrains_Mono'] font-bold flex items-center gap-1 text-sm ${getChangeColor(
                              fund.estimatedGrowthRate
                            )}`}
                          >
                            {getChangeIcon(fund.estimatedGrowthRate)}
                            {formatPercent(fund.estimatedGrowthRate)}
                          </span>
                        )} */}

                        {transactionCount > 0 && (
                          <Badge
                            variant="secondary"
                            className="bg-news-accent text-news-muted font-['Source_Sans_3'] text-xs"
                          >
                            <History className="w-3 h-3 mr-1" />
                            {transactionCount}笔
                          </Badge>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveFund(fundCode, group.id);
                          }}
                          className="text-news-muted hover:text-news-text hover:bg-gray-100 h-8 w-8 p-0"
                          title="移动到分组"
                        >
                          <Move className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFund(fundCode);
                          }}
                          className="text-news-muted hover:text-finance-rise hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-news-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-news-muted" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-2 bg-paper-100 border-b border-paper-300">
                        <TransactionManager fund={fund} />
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

      <div className="border-t-2 border-news-border pt-4">
        <div className="flex items-center justify-between text-xs text-news-muted font-['Source_Sans_3']">
          <span>
            共 {groups.length} 个分组，{watchlist.length} 只基金
          </span>
          <span>数据来源：追基日报</span>
        </div>
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
                  className="w-full justify-start border-news-border hover:bg-news-accent hover:border-news-text font-['Source_Sans_3']"
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
  );
}

