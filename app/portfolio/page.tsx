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
import { formatNumber, formatPercent, getChangeColor, cn } from "@/lib/utils";
import {
  Trash2,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Move,
  Wallet,
  Edit3,
  X,
} from "lucide-react";

export default function PortfolioPage() {
  const {
    watchlist,
    groups,
    addGroup,
    removeGroup,
    removeFund,
    addFundToGroup,
    removeFundFromGroup,
    setFundPosition,
    removeFundPosition,
  } = useFundsStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [movingFund, setMovingFund] = useState<{
    code: string;
    fromGroupId: string;
  } | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

  // 持仓配置对话框状态
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [positionShares, setPositionShares] = useState("");
  const [positionCost, setPositionCost] = useState("");
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);

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

  // 打开持仓配置对话框
  const handleEditPosition = (fund: Fund) => {
    setEditingFund(fund);
    setPositionShares(fund.shares?.toString() || "");
    setPositionCost(fund.costPrice?.toString() || "");
    setIsPositionDialogOpen(true);
  };

  // 保存持仓配置
  const handleSavePosition = () => {
    if (editingFund && positionShares && positionCost) {
      const shares = parseFloat(positionShares);
      const costPrice = parseFloat(positionCost);
      if (shares > 0 && costPrice > 0) {
        setFundPosition(editingFund.code, shares, costPrice);
      }
    }
    setIsPositionDialogOpen(false);
    setEditingFund(null);
    setPositionShares("");
    setPositionCost("");
  };

  // 移除持仓配置
  const handleRemovePosition = (code: string) => {
    removeFundPosition(code);
  };

  // 计算持仓市值
  const calculateMarketValue = (fund: Fund) => {
    if (fund.shares && fund.estimatedNetValue) {
      return fund.shares * fund.estimatedNetValue;
    }
    return 0;
  };

  // 计算持仓收益
  const calculateProfit = (fund: Fund) => {
    if (fund.shares && fund.costPrice && fund.estimatedNetValue) {
      return fund.shares * (fund.estimatedNetValue - fund.costPrice);
    }
    return 0;
  };

  // 计算收益百分比
  const calculateProfitPercent = (fund: Fund) => {
    if (fund.costPrice && fund.estimatedNetValue && fund.costPrice > 0) {
      return ((fund.estimatedNetValue - fund.costPrice) / fund.costPrice) * 100;
    }
    return 0;
  };

  // 计算总成本
  const calculateTotalCost = (fund: Fund) => {
    return (fund.shares || 0) * (fund.costPrice || 0);
  };

  // 计算所有持仓基金的总市值和总收益
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
      {/* 页面标题区 */}
      <div className="border-b-2 border-[#2D2A26] pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block bg-[#C41E3A] text-white text-xs font-bold px-2 py-1 uppercase tracking-[0.2em] font-['Source_Sans_3'] mb-2">
              投资管理
            </span>
            <h1 className="font-['Newsreader'] text-3xl font-bold text-[#2D2A26]">
              基金管理
            </h1>
          </div>
          <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#2D2A26] hover:bg-[#2D2A26] hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em]"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                新建分组
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-2 border-[#2D2A26]">
              <DialogHeader>
                <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-[#2D2A26]">
                  新建分组
                </DialogTitle>
              </DialogHeader>
              <div className="flex gap-2 mt-4">
                <Input
                  placeholder="输入分组名称..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                  className="flex-1 border-[#C9C2B5]"
                />
                <Button
                  onClick={handleAddGroup}
                  className="bg-[#2D2A26] hover:bg-[#1a1815]"
                >
                  添加
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 投资组合总览 */}
      {portfolioSummary.totalCost > 0 && (
        <div className="bg-[#F5F0E6] border border-[#C9C2B5] p-6">
          <h2 className="font-['Newsreader'] text-xl font-bold text-[#2D2A26] mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            投资组合总览
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-[#6B6560] font-['Source_Sans_3'] mb-1">
                总成本
              </div>
              <div className="font-['JetBrains_Mono'] text-lg text-[#2D2A26]">
                ¥{formatNumber(portfolioSummary.totalCost, 2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6560] font-['Source_Sans_3'] mb-1">
                总市值
              </div>
              <div className="font-['JetBrains_Mono'] text-lg text-[#2D2A26]">
                ¥{formatNumber(portfolioSummary.totalMarketValue, 2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6560] font-['Source_Sans_3'] mb-1">
                总收益
              </div>
              <div
                className={cn(
                  "font-['JetBrains_Mono'] text-lg font-bold flex items-center gap-1",
                  getChangeColor(portfolioSummary.totalProfit)
                )}
              >
                {getChangeIcon(portfolioSummary.totalProfit)}¥
                {formatNumber(Math.abs(portfolioSummary.totalProfit), 2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B6560] font-['Source_Sans_3'] mb-1">
                收益率
              </div>
              <div
                className={cn(
                  "font-['JetBrains_Mono'] text-lg font-bold flex items-center gap-1",
                  getChangeColor(totalProfitPercent)
                )}
              >
                {getChangeIcon(totalProfitPercent)}
                {formatPercent(totalProfitPercent)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分组卡片网格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group: FundGroup) => (
          <div key={group.id} className="border border-[#C9C2B5] bg-white">
            {/* 分组标题栏 */}
            <div className="border-b-2 border-[#2D2A26] px-5 py-4 flex items-center justify-between bg-[#F5F0E6]">
              <h2 className="font-['Libre_Baskerville'] text-xl font-bold text-[#2D2A26]">
                {group.name}
              </h2>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-white text-[#8B0000] font-['Source_Sans_3'] text-xs border border-[#C9C2B5]"
                >
                  {group.funds.length}只基金
                </Badge>
                {group.id !== "default" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGroup(group.id)}
                    className="text-[#6B6560] hover:text-[#C41E3A] hover:bg-red-50 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* 基金列表 */}
            <div>
              {group.funds.map((fundCode: string, index: number) => {
                const fund = getFundByCode(fundCode);
                if (!fund) return null;

                const hasPosition = fund.shares && fund.costPrice;
                const profit = calculateProfit(fund);
                const profitPercent = calculateProfitPercent(fund);

                return (
                  <div
                    key={fundCode}
                    className={`flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors ${
                      index !== group.funds.length - 1
                        ? "border-b border-[#E5E5E5]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-[#2D2A26] flex items-center justify-center">
                        <span className="font-['Newsreader'] font-bold text-white text-sm">
                          {fund.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26] truncate">
                          {fund.name}
                        </div>
                        <span className="text-xs text-[#6B6560] font-['JetBrains_Mono']">
                          {fundCode}
                        </span>
                        {hasPosition && (
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="text-[#6B6560] font-['JetBrains_Mono']">
                              {fund.shares}份
                            </span>
                            <span className="text-[#6B6560]">|</span>
                            <span
                              className={cn(
                                "font-['JetBrains_Mono'] font-bold flex items-center gap-1",
                                getChangeColor(profit)
                              )}
                            >
                            {getChangeIcon(profit)}¥
                              {formatNumber(Math.abs(profit), 2)}
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
                    <div className="flex items-center gap-1">
                      {fund.estimatedGrowthRate !== undefined && (
                        <span
                          className={`font-['JetBrains_Mono'] font-bold flex items-center gap-1 text-sm ${getChangeColor(
                            fund.estimatedGrowthRate
                          )}`}
                        >
                          {getChangeIcon(fund.estimatedGrowthRate)}
                          {formatPercent(fund.estimatedGrowthRate)}
                        </span>
                      )}

                      {/* 持仓配置按钮 */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPosition(fund)}
                        className={cn(
                          "hover:bg-gray-100 h-8 w-8 p-0",
                          hasPosition
                            ? "text-[#2D2A26]"
                            : "text-[#6B6560] hover:text-[#2D2A26]"
                        )}
                        title={hasPosition ? "修改持仓" : "添加持仓"}
                      >
                        {hasPosition ? (
                          <Edit3 className="w-4 h-4" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveFund(fundCode, group.id)}
                        className="text-[#6B6560] hover:text-[#2D2A26] hover:bg-gray-100 h-8 w-8 p-0"
                        title="移动到分组"
                      >
                        <Move className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFund(fundCode)}
                        className="text-[#6B6560] hover:text-[#C41E3A] hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {group.funds.length === 0 && (
                <div className="p-8 text-center text-[#6B6560] font-['Source_Sans_3']">
                  该分组暂无基金
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 底部统计 */}
      <div className="border-t-2 border-[#C9C2B5] pt-4">
        <div className="flex items-center justify-between text-xs text-[#6B6560] font-['Source_Sans_3']">
          <span>
            共 {groups.length} 个分组，{watchlist.length} 只基金
          </span>
          <span>数据来源：追基日报</span>
        </div>
      </div>

      {/* 移动基金对话框 */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-md border-2 border-[#2D2A26]">
          <DialogHeader>
            <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-[#2D2A26]">
              移动到其他分组
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#6B6560] font-['Source_Sans_3'] mb-4">
              选择目标分组：
            </p>
            {groups
              .filter((g) => g.id !== movingFund?.fromGroupId)
              .map((group) => (
                <Button
                  key={group.id}
                  variant="outline"
                  className="w-full justify-start border-[#C9C2B5] hover:bg-[#F5F0E6] hover:border-[#2D2A26] font-['Source_Sans_3']"
                  onClick={() => executeMoveFund(group.id)}
                >
                  <FolderPlus className="w-4 h-4 mr-2 text-[#6B6560]" />
                  {group.name}
                  <span className="ml-auto text-xs text-[#6B6560]">
                    {group.funds.length}只基金
                  </span>
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 持仓配置对话框 */}
      <Dialog
        open={isPositionDialogOpen}
        onOpenChange={setIsPositionDialogOpen}
      >
        <DialogContent className="sm:max-w-md border-2 border-[#2D2A26]">
          <DialogHeader>
            <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-[#2D2A26]">
              {editingFund?.shares ? "修改持仓" : "添加持仓"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {editingFund && (
              <div className="p-3 bg-[#F5F0E6] rounded">
                <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                  {editingFund.name}
                </div>
                <div className="text-xs text-[#6B6560] font-['JetBrains_Mono']">
                  {editingFund.code}
                </div>
                {editingFund.estimatedNetValue && (
                  <div className="text-xs text-[#6B6560] mt-1">
                    最新净值:{" "}
                    <span className="font-['JetBrains_Mono']">
                      {formatNumber(editingFund.estimatedNetValue, 2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="text-sm text-[#6B6560] font-['Source_Sans_3'] block mb-2">
                持有份额
              </label>
              <Input
                type="number"
                placeholder="输入持有份额..."
                value={positionShares}
                onChange={(e) => setPositionShares(e.target.value)}
                className="border-[#C9C2B5] font-['JetBrains_Mono']"
              />
            </div>

            <div>
              <label className="text-sm text-[#6B6560] font-['Source_Sans_3'] block mb-2">
                成本价（元/份）
              </label>
              <Input
                type="number"
                step="0.0001"
                placeholder="输入成本价..."
                value={positionCost}
                onChange={(e) => setPositionCost(e.target.value)}
                className="border-[#C9C2B5] font-['JetBrains_Mono']"
              />
            </div>

            {positionShares && positionCost && editingFund && (
              <div className="p-3 bg-[#F9F8F6] rounded border border-[#C9C2B5]">
                <div className="text-xs text-[#6B6560] font-['Source_Sans_3'] mb-2">
                  预估信息
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6560]">总成本:</span>
                  <span className="font-['JetBrains_Mono'] text-[#2D2A26]">
                    ¥
                    {formatNumber(
                      parseFloat(positionShares) * parseFloat(positionCost),
                      2
                    )}
                  </span>
                </div>
                {editingFund.estimatedNetValue && (
                  <>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-[#6B6560]">预估市值:</span>
                      <span className="font-['JetBrains_Mono'] text-[#2D2A26]">
                        ¥
                        {formatNumber(
                          parseFloat(positionShares) *
                            editingFund.estimatedNetValue,
                          2
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-[#6B6560]">预估收益:</span>
                      <span
                        className={cn(
                          "font-['JetBrains_Mono'] font-bold",
                          getChangeColor(
                            parseFloat(positionShares) *
                              (editingFund.estimatedNetValue -
                                parseFloat(positionCost))
                          )
                        )}
                      >
                        {parseFloat(positionShares) *
                          (editingFund.estimatedNetValue -
                            parseFloat(positionCost)) >=
                        0
                          ? "+"
                          : ""}
                        ¥
                        {formatNumber(
                          Math.abs(
                            parseFloat(positionShares) *
                              (editingFund.estimatedNetValue -
                                parseFloat(positionCost))
                          ),
                          2
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {editingFund?.shares && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (editingFund) {
                      handleRemovePosition(editingFund.code);
                      setIsPositionDialogOpen(false);
                      setEditingFund(null);
                    }
                  }}
                  className="flex-1 border-[#C41E3A] text-[#C41E3A] hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  清除持仓
                </Button>
              )}
              <Button
                onClick={handleSavePosition}
                disabled={!positionShares || !positionCost}
                className="flex-1 bg-[#2D2A26] hover:bg-[#1a1815] disabled:opacity-50"
              >
                保存
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

