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
import { formatPercent, getChangeColor } from "@/lib/utils";
import {
  Trash2,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Minus,
  Move,
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
  } = useFundsStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [movingFund, setMovingFund] = useState<{
    code: string;
    fromGroupId: string;
  } | null>(null);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);

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
              组合管理
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

                return (
                  <div
                    key={fundCode}
                    className={`flex items-center justify-between p-4 hover:bg-[#F9F8F6] transition-colors ${
                      index !== group.funds.length - 1
                        ? "border-b border-[#E5E5E5]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#2D2A26] flex items-center justify-center">
                        <span className="font-['Newsreader'] font-bold text-white text-sm">
                          {fund.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                          {fund.name}
                        </div>
                        <span className="text-xs text-[#6B6560] font-['JetBrains_Mono']">
                          {fundCode}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {fund.dailyGrowthRate !== undefined && (
                        <span
                          className={`font-['JetBrains_Mono'] font-bold flex items-center gap-1 ${getChangeColor(
                            fund.dailyGrowthRate
                          )}`}
                        >
                          {getChangeIcon(fund.dailyGrowthRate)}
                          {formatPercent(fund.dailyGrowthRate)}
                        </span>
                      )}
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
    </div>
  );
}

