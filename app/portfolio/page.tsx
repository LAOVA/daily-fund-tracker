"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useFundsStore } from "@/stores/fundsStore";
import { formatPercent, getChangeColor } from "@/lib/utils";
import {
  Trash2,
  FolderPlus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export default function PortfolioPage() {
  const {
    watchlist,
    groups,
    addGroup,
    removeGroup,
    removeFund,
  } = useFundsStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim());
      setNewGroupName("");
      setIsAddGroupOpen(false);
    }
  };

  const getFundByCode = (code: string) => {
    return watchlist.find((f) => f.code === code);
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3 inline" />;
    if (value < 0) return <TrendingDown className="w-3 h-3 inline" />;
    return <Minus className="w-3 h-3 inline" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[#2D2A26] headline-underline">
          组合管理
        </h1>
        <Dialog open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-[#C9C2B5] hover:bg-[#F5F0E6]"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              新建分组
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-['Playfair_Display']">
                新建分组
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="输入分组名称..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddGroup()}
                className="flex-1"
              />
              <Button onClick={handleAddGroup}>添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="border-3 border-[#C9C2B5]">
            <CardHeader className="border-b-2 border-[#C9C2B5] px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-['Playfair_Display'] text-xl font-bold text-[#2D2A26]">
                  {group.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#F5F0E6] text-[#8B0000] font-['Source_Sans_3']"
                  >
                    {group.funds.length}只基金
                  </Badge>
                  {group.id !== "default" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                      className="text-[#6B6560] hover:text-[#C41E3A]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {group.funds.map((fundCode) => {
                  const fund = getFundByCode(fundCode);
                  if (!fund) return null;

                  return (
                    <div
                      key={fundCode}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#2D2A26] flex items-center justify-center">
                          <span className="font-['Playfair_Display'] font-bold text-white text-sm">
                            {fund.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                            {fund.name}
                          </div>
                          <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                            {fundCode}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {fund.dailyGrowthRate !== undefined && (
                          <span
                            className={`font-mono font-bold ${getChangeColor(
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
                          onClick={() => removeFund(fundCode)}
                          className="text-[#6B6560] hover:text-[#C41E3A]"
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
