"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useFundsStore,
  Transaction,
  TransactionType,
} from "@/stores/fundsStore";
import { Fund } from "@/stores/fundsStore";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Coins,
  Trash2,
  Edit3,
  History,
  Calculator,
} from "lucide-react";

interface TransactionManagerProps {
  fund: Fund;
}

const transactionTypeConfig: Record<
  TransactionType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  buy: {
    label: "买入",
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-finance-rise",
  },
  sell: {
    label: "卖出",
    icon: <TrendingDown className="w-4 h-4" />,
    color: "text-finance-fall",
  },
  dividend: {
    label: "分红",
    icon: <Coins className="w-4 h-4" />,
    color: "text-finance-neutral",
  },
};

export function TransactionManager({ fund }: TransactionManagerProps) {
  const { transactions, addTransaction, updateTransaction, removeTransaction, recalculatePosition } =
    useFundsStore();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>("buy");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionShares, setTransactionShares] = useState("");
  const [transactionPrice, setTransactionPrice] = useState("");
  const [transactionFee, setTransactionFee] = useState("0");
  const [transactionRemark, setTransactionRemark] = useState("");

  const fundTransactions = transactions
    .filter((t) => t.fundCode === fund.code)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const resetForm = () => {
    setTransactionType("buy");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setTransactionShares("");
    setTransactionPrice("");
    setTransactionFee("0");
    setTransactionRemark("");
    setEditingTransaction(null);
  };

  const handleAddTransaction = () => {
    const shares = parseFloat(transactionShares);
    const price = parseFloat(transactionPrice);
    const fee = parseFloat(transactionFee) || 0;

    if (!shares || !price || shares <= 0 || price <= 0) return;

    const amount = shares * price;

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        type: transactionType,
        date: transactionDate,
        shares,
        price,
        amount,
        fee,
        remark: transactionRemark || undefined,
      });
    } else {
      addTransaction({
        fundCode: fund.code,
        type: transactionType,
        date: transactionDate,
        shares,
        price,
        amount,
        fee,
        remark: transactionRemark || undefined,
      });
    }

    recalculatePosition(fund.code);
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setTransactionDate(transaction.date);
    setTransactionShares(transaction.shares.toString());
    setTransactionPrice(transaction.price.toString());
    setTransactionFee(transaction.fee.toString());
    setTransactionRemark(transaction.remark || "");
    setIsAddDialogOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    removeTransaction(id);
    recalculatePosition(fund.code);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const calculatedAmount =
    parseFloat(transactionShares) && parseFloat(transactionPrice)
      ? parseFloat(transactionShares) * parseFloat(transactionPrice)
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-news-muted" />
          <span className="text-sm font-bold text-news-text font-['Source_Sans_3'] uppercase tracking-wider">
            交易记录
          </span>
          <span className="text-xs text-news-muted">({fundTransactions.length}笔)</span>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={openAddDialog}
              className="h-7 text-xs border-news-border hover:bg-news-accent"
            >
              <Plus className="w-3 h-3 mr-1" />
              添加记录
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md border-2 border-news-text">
            <DialogHeader>
              <DialogTitle className="font-['Newsreader'] text-xl font-bold text-news-text">
                {editingTransaction ? "编辑交易记录" : "添加交易记录"}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 p-3 bg-news-accent rounded-lg border border-news-border">
                <div className="w-10 h-10 bg-news-text rounded-lg flex items-center justify-center">
                  <span className="font-['Newsreader'] font-bold text-white">
                    {fund.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-['Libre_Baskerville'] font-bold text-news-text text-sm">
                    {fund.name}
                  </div>
                  <div className="text-xs text-news-muted font-['JetBrains_Mono']">
                    {fund.code}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                  交易类型
                </label>
                <div className="flex gap-2">
                  {(Object.keys(transactionTypeConfig) as TransactionType[]).map((type) => {
                    const config = transactionTypeConfig[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setTransactionType(type)}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-lg border text-sm font-['Source_Sans_3'] flex items-center justify-center gap-1 transition-colors",
                          transactionType === type
                            ? "border-news-text bg-news-text text-white"
                            : "border-news-border hover:bg-news-accent text-news-text"
                        )}
                      >
                        {config.icon}
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                    交易日期
                  </label>
                  <Input
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="border-news-border font-['JetBrains_Mono'] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                    份额
                  </label>
                  <Input
                    type="number"
                    placeholder="输入份额"
                    value={transactionShares}
                    onChange={(e) => setTransactionShares(e.target.value)}
                    className="border-news-border font-['JetBrains_Mono'] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                    单价（元/份）
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="输入单价"
                    value={transactionPrice}
                    onChange={(e) => setTransactionPrice(e.target.value)}
                    className="border-news-border font-['JetBrains_Mono'] text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                    手续费（元）
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={transactionFee}
                    onChange={(e) => setTransactionFee(e.target.value)}
                    className="border-news-border font-['JetBrains_Mono'] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-news-muted font-['Source_Sans_3'] block mb-2">
                  备注
                </label>
                <Input
                  placeholder="可选备注..."
                  value={transactionRemark}
                  onChange={(e) => setTransactionRemark(e.target.value)}
                  className="border-news-border font-['Source_Sans_3'] text-sm"
                />
              </div>

              {calculatedAmount > 0 && (
                <div className="p-3 bg-news-accent rounded-lg border border-news-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-news-muted font-['Source_Sans_3']">
                      交易金额
                    </span>
                    <span className="font-['JetBrains_Mono'] font-bold text-news-text">
                      {formatCurrency(calculatedAmount, false)}
                    </span>
                  </div>
                  {parseFloat(transactionFee) > 0 && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-news-muted font-['Source_Sans_3']">
                        + 手续费
                      </span>
                      <span className="font-['JetBrains_Mono'] text-news-text">
                        {formatCurrency(parseFloat(transactionFee), false)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-news-border">
                    <span className="text-news-muted font-['Source_Sans_3']">
                      合计
                    </span>
                    <span className="font-['JetBrains_Mono'] font-bold text-finance-rise">
                      {formatCurrency(
                        calculatedAmount + (parseFloat(transactionFee) || 0),
                        false
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {editingTransaction && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetForm();
                      setIsAddDialogOpen(false);
                    }}
                    className="flex-1 border-news-border"
                  >
                    取消
                  </Button>
                )}
                <Button
                  onClick={handleAddTransaction}
                  disabled={
                    !transactionShares ||
                    !transactionPrice ||
                    parseFloat(transactionShares) <= 0 ||
                    parseFloat(transactionPrice) <= 0
                  }
                  className="flex-1 bg-news-text hover:bg-paper-900 disabled:opacity-50"
                >
                  {editingTransaction ? "保存" : "添加"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fundTransactions.length > 0 ? (
        <div className="border border-news-border rounded-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-news-border bg-news-accent">
                  <th className="text-left py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text">
                    日期
                  </th>
                  <th className="text-left py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text">
                    类型
                  </th>
                  <th className="text-right py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text">
                    份额
                  </th>
                  <th className="text-right py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text">
                    单价
                  </th>
                  <th className="text-right py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text">
                    金额
                  </th>
                  <th className="text-right py-2 px-3 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-wider text-news-text w-16">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {fundTransactions.map((transaction, index) => {
                  const config = transactionTypeConfig[transaction.type];
                  return (
                    <tr
                      key={transaction.id}
                      className={cn(
                        "border-b border-paper-300",
                        index % 2 === 0 ? "bg-white" : "bg-paper-100"
                      )}
                    >
                      <td className="py-2 px-3 font-['JetBrains_Mono'] text-news-text">
                        {transaction.date}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "flex items-center gap-1 font-['Source_Sans_3'] font-medium",
                            config.color
                          )}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-['JetBrains_Mono'] text-news-text">
                        {transaction.shares.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-['JetBrains_Mono'] text-news-text">
                        {transaction.price.toFixed(4)}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="font-['JetBrains_Mono'] font-bold text-news-text">
                          {formatCurrency(transaction.amount, false)}
                        </div>
                        {transaction.fee > 0 && (
                          <div className="text-xs text-news-muted">
                            +{transaction.fee.toFixed(2)}费
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditTransaction(transaction)}
                            className="h-6 w-6 p-0 text-news-muted hover:text-news-text hover:bg-paper-100"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="h-6 w-6 p-0 text-news-muted hover:text-finance-rise hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-news-muted text-sm font-['Source_Sans_3'] border border-dashed border-news-border rounded-lg">
          暂无交易记录，点击"添加记录"开始记录
        </div>
      )}

      {fundTransactions.length > 0 && (
        <div className="flex items-center justify-between text-xs p-3 bg-news-accent rounded-lg border border-news-border">
          <div className="flex items-center gap-1 text-news-muted">
            <Calculator className="w-3 h-3" />
            <span className="font-['Source_Sans_3']">持仓成本自动计算</span>
          </div>
          <div className="font-['JetBrains_Mono'] text-news-text">
            <span className="text-news-muted">当前份额：</span>
            <span className="font-bold">{fund.shares?.toFixed(2) || "0.00"}</span>
            <span className="text-news-muted ml-3">成本价：</span>
            <span className="font-bold">{fund.costPrice?.toFixed(4) || "0.0000"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
