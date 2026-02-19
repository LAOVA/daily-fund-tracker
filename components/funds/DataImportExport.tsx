"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFundsStore, Fund, Transaction, FundGroup } from "@/stores/fundsStore";
import {
  downloadFile,
  exportToCSV,
  exportToJSON,
  parseCSV,
  parseJSON,
  readFileAsText,
  formatCurrency,
} from "@/lib/utils";
import { fetchMultipleFundData } from "@/lib/useFundData";
import {
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

type ExportType = "funds" | "transactions" | "portfolio" | "all";
type ImportType = "funds" | "transactions" | "backup";

export function DataImportExport() {
  const {
    watchlist,
    groups,
    transactions,
    dividends,
    addFund,
    addTransaction,
    updateFund,
    addGroup,
    addFundToGroup,
  } = useFundsStore();

  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<ImportType>("funds");

  const getFundGroupName = (fundCode: string): string => {
    const group = groups.find((g) => g.funds.includes(fundCode));
    return group?.name || "未分组";
  };

  const handleExport = (type: ExportType, format: "csv" | "json") => {
    let data: Record<string, unknown>[] = [];
    let headers: string[] = [];
    let filename = "";
    let content = "";

    const timestamp = new Date().toISOString().split("T")[0];

    switch (type) {
      case "funds":
        data = watchlist.map((f) => ({
          code: f.code,
          name: f.name,
          shares: f.shares || "",
          costPrice: f.costPrice || "",
          group: getFundGroupName(f.code),
        }));
        headers = ["code", "name", "shares", "costPrice", "group"];
        filename = `基金列表_${timestamp}`;
        break;

      case "transactions":
        data = transactions.map((t) => ({
          fundCode: t.fundCode,
          type: t.type,
          date: t.date,
          shares: t.shares,
          price: t.price,
          amount: t.amount,
          fee: t.fee,
          remark: t.remark || "",
        }));
        headers = ["fundCode", "type", "date", "shares", "price", "amount", "fee", "remark"];
        filename = `交易记录_${timestamp}`;
        break;

      case "portfolio":
        data = watchlist
          .filter((f) => f.shares && f.costPrice)
          .map((f) => {
            const marketValue = (f.shares || 0) * (f.estimatedNetValue || 0);
            const profit = (f.shares || 0) * ((f.estimatedNetValue || 0) - (f.costPrice || 0));
            const profitPercent = f.costPrice
              ? (((f.estimatedNetValue || 0) - f.costPrice) / f.costPrice) * 100
              : 0;
            return {
              code: f.code,
              name: f.name,
              shares: f.shares,
              costPrice: f.costPrice,
              costAmount: (f.shares || 0) * (f.costPrice || 0),
              estimatedNetValue: f.estimatedNetValue || "",
              marketValue,
              profit,
              profitPercent: profitPercent.toFixed(2),
              group: getFundGroupName(f.code),
            };
          });
        headers = [
          "code",
          "name",
          "shares",
          "costPrice",
          "costAmount",
          "estimatedNetValue",
          "marketValue",
          "profit",
          "profitPercent",
          "group",
        ];
        filename = `持仓报告_${timestamp}`;
        break;

      case "all":
        const backupData = {
          version: "1.0",
          exportTime: new Date().toISOString(),
          watchlist,
          groups,
          transactions,
          dividends,
        };
        content = exportToJSON(backupData);
        filename = `基金数据备份_${timestamp}.json`;
        downloadFile(content, filename, "application/json");
        setExportOpen(false);
        return;
    }

    if (format === "csv") {
      content = exportToCSV(data, headers);
      filename += ".csv";
      downloadFile(content, filename, "text/csv;charset=utf-8");
    } else {
      content = exportToJSON(data);
      filename += ".json";
      downloadFile(content, filename, "application/json");
    }

    setExportOpen(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      let imported = 0;

      if (importType === "funds") {
        let fundList: Array<{ code: string; name: string; shares?: number; costPrice?: number; group?: string }> = [];

        if (file.name.endsWith(".json")) {
          const parsed = parseJSON(content);
          if (Array.isArray(parsed)) {
            fundList = parsed as Array<{ code: string; name: string; group?: string }>;
          } else if (parsed && typeof parsed === "object" && "watchlist" in parsed) {
            fundList = (parsed as { watchlist: Fund[] }).watchlist;
          }
        } else {
          const rows = parseCSV(content);
          fundList = rows.map((row) => ({
            code: row.code || row["基金代码"] || "",
            name: row.name || row["基金名称"] || "",
            shares: row.shares ? parseFloat(row.shares) : undefined,
            costPrice: row.costPrice ? parseFloat(row.costPrice) : undefined,
            group: row.group || row["分组"] || "",
          }));
        }

        const groupNameToId = new Map<string, string>();
        groups.forEach((g) => groupNameToId.set(g.name, g.id));

        fundList.forEach((f) => {
          if (f.code && f.name) {
            const exists = watchlist.some((wf) => wf.code === f.code);
            if (!exists) {
              let targetGroupId = "default";
              
              if (f.group && f.group !== "未分组" && f.group !== "默认分组") {
                let groupId = groupNameToId.get(f.group);
                if (!groupId) {
                  addGroup(f.group);
                  const newGroups = useFundsStore.getState().groups;
                  const newGroup = newGroups.find((g) => g.name === f.group);
                  if (newGroup) {
                    groupId = newGroup.id;
                    groupNameToId.set(f.group, groupId);
                  }
                }
                if (groupId) {
                  targetGroupId = groupId;
                }
              }
              
              addFund(
                {
                  code: f.code,
                  name: f.name,
                  shares: f.shares,
                  costPrice: f.costPrice,
                },
                targetGroupId
              );
              imported++;
            }
          }
        });

        if (imported > 0) {
          setImporting(true);
          const codes = fundList
            .filter((f) => f.code && f.name)
            .filter((f) => !watchlist.some((wf) => wf.code === f.code && wf.estimatedNetValue))
            .map((f) => f.code);

          fetchMultipleFundData(codes, (code: string, data: any) => {
            if (data) {
              updateFund(code, {
                code: data.code,
                name: data.name,
                previousNetAssetValue: data.previousNetAssetValue,
                estimatedNetValue: data.estimatedNetValue,
                estimatedGrowthRate: data.estimatedGrowthRate,
                yesterdayChange: data.yesterdayChange,
                lastWeekGrowthRate: data.lastWeekChange,
                lastMonthGrowthRate: data.lastMonthChange,
                updateTime: new Date().toISOString(),
              });
            }
          }).finally(() => {
            setImporting(false);
          });
        }

        setImportResult({
          success: true,
          message: `成功导入 ${imported} 只基金${fundList.length - imported > 0 ? `，跳过 ${fundList.length - imported} 只已存在的基金` : ""}，正在获取数据...`,
        });
      } else if (importType === "transactions") {
        let txList: Array<{
          fundCode: string;
          type: "buy" | "sell" | "dividend";
          date: string;
          shares: number;
          price: number;
          amount: number;
          fee: number;
          remark?: string;
        }> = [];

        if (file.name.endsWith(".json")) {
          const parsed = parseJSON(content);
          if (Array.isArray(parsed)) {
            txList = parsed as typeof txList;
          } else if (parsed && typeof parsed === "object" && "transactions" in parsed) {
            txList = (parsed as { transactions: Transaction[] }).transactions;
          }
        } else {
          const rows = parseCSV(content);
          txList = rows.map((row) => ({
            fundCode: row.fundCode || row["基金代码"] || "",
            type: (row.type || row["类型"] || "buy") as "buy" | "sell" | "dividend",
            date: row.date || row["日期"] || "",
            shares: parseFloat(row.shares || row["份额"] || "0"),
            price: parseFloat(row.price || row["价格"] || "0"),
            amount: parseFloat(row.amount || row["金额"] || "0"),
            fee: parseFloat(row.fee || row["手续费"] || "0"),
            remark: row.remark || row["备注"] || "",
          }));
        }

        txList.forEach((tx) => {
          if (tx.fundCode && tx.date) {
            addTransaction({
              fundCode: tx.fundCode,
              type: tx.type,
              date: tx.date,
              shares: tx.shares,
              price: tx.price,
              amount: tx.amount,
              fee: tx.fee,
              remark: tx.remark,
            });
            imported++;
          }
        });

        setImportResult({
          success: true,
          message: `成功导入 ${imported} 条交易记录`,
        });
      } else if (importType === "backup") {
        const parsed = parseJSON(content) as {
          watchlist?: Fund[];
          groups?: FundGroup[];
          transactions?: Transaction[];
          dividends?: unknown[];
        } | null;

        const importedCodes: string[] = [];

        if (parsed) {
          const oldIdToNewId = new Map<string, string>();
          
          if (parsed.groups && parsed.groups.length > 0) {
            parsed.groups.forEach((g) => {
              if (g.id === "default") {
                oldIdToNewId.set(g.id, "default");
              } else {
                const existingGroup = groups.find((eg) => eg.name === g.name);
                if (existingGroup) {
                  oldIdToNewId.set(g.id, existingGroup.id);
                } else {
                  addGroup(g.name);
                  const newGroups = useFundsStore.getState().groups;
                  const newGroup = newGroups.find((ng) => ng.name === g.name && ng.id !== g.id);
                  if (newGroup) {
                    oldIdToNewId.set(g.id, newGroup.id);
                  }
                }
              }
            });
          }

          if (parsed.watchlist) {
            parsed.watchlist.forEach((f) => {
              const exists = watchlist.some((wf) => wf.code === f.code);
              if (!exists) {
                let targetGroupId = "default";
                
                if (parsed.groups) {
                  for (const g of parsed.groups) {
                    if (g.funds.includes(f.code)) {
                      const mappedId = oldIdToNewId.get(g.id);
                      if (mappedId) {
                        targetGroupId = mappedId;
                      }
                      break;
                    }
                  }
                }
                
                addFund(f, targetGroupId);
                importedCodes.push(f.code);
                imported++;
              }
            });
          }

          if (parsed.transactions) {
            parsed.transactions.forEach((tx) => {
              addTransaction({
                fundCode: tx.fundCode,
                type: tx.type,
                date: tx.date,
                shares: tx.shares,
                price: tx.price,
                amount: tx.amount,
                fee: tx.fee,
                remark: tx.remark,
              });
              imported++;
            });
          }
        }

        if (importedCodes.length > 0) {
          setImporting(true);
          fetchMultipleFundData(importedCodes, (code: string, data: any) => {
            if (data) {
              updateFund(code, {
                code: data.code,
                name: data.name,
                previousNetAssetValue: data.previousNetAssetValue,
                estimatedNetValue: data.estimatedNetValue,
                estimatedGrowthRate: data.estimatedGrowthRate,
                yesterdayChange: data.yesterdayChange,
                lastWeekGrowthRate: data.lastWeekChange,
                lastMonthGrowthRate: data.lastMonthChange,
                updateTime: new Date().toISOString(),
              });
            }
          }).finally(() => {
            setImporting(false);
          });
        }

        setImportResult({
          success: true,
          message: `成功恢复数据：${imported} 条记录${importedCodes.length > 0 ? "，正在获取基金数据..." : ""}`,
        });
      }
    } catch {
      setImportResult({
        success: false,
        message: "导入失败，请检查文件格式是否正确",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportDialogChange = (open: boolean) => {
    setImportOpen(open);
    if (!open) {
      setImportResult(null);
    }
  };

  const totalMarketValue = watchlist
    .filter((f) => f.shares && f.estimatedNetValue)
    .reduce((sum, f) => sum + (f.shares || 0) * (f.estimatedNetValue || 0), 0);

  const totalCost = watchlist
    .filter((f) => f.shares && f.costPrice)
    .reduce((sum, f) => sum + (f.shares || 0) * (f.costPrice || 0), 0);

  const totalProfit = totalMarketValue - totalCost;

  return (
    <div className="flex gap-2">
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-news-text hover:bg-news-text hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em]"
          >
            <Download className="w-4 h-4 mr-2" />
            导出数据
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg border-2 border-news-text">
          <DialogHeader>
            <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-news-text">
              导出数据
            </DialogTitle>
          </DialogHeader>

          {totalCost > 0 && (
            <div className="bg-news-accent border border-news-border p-4 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-news-muted font-['Source_Sans_3']">总成本</div>
                  <div className="font-['JetBrains_Mono'] font-bold text-news-text">
                    {formatCurrency(totalCost)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-news-muted font-['Source_Sans_3']">总市值</div>
                  <div className="font-['JetBrains_Mono'] font-bold text-news-text">
                    {formatCurrency(totalMarketValue)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-news-muted font-['Source_Sans_3']">总收益</div>
                  <div
                    className={`font-['JetBrains_Mono'] font-bold ${totalProfit >= 0 ? "text-finance-rise" : "text-finance-fall"}`}
                  >
                    {formatCurrency(totalProfit)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="border border-news-border p-4 bg-card">
                <h3 className="font-['Libre_Baskerville'] font-bold text-news-text mb-3">
                  基金列表
                </h3>
                <p className="text-xs text-news-muted mb-3">
                  导出 {watchlist.length} 只基金的基本信息
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("funds", "csv")}
                    className="border-news-border hover:bg-news-accent"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("funds", "json")}
                    className="border-news-border hover:bg-news-accent"
                  >
                    <FileJson className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>

              <div className="border border-news-border p-4 bg-card">
                <h3 className="font-['Libre_Baskerville'] font-bold text-news-text mb-3">
                  交易记录
                </h3>
                <p className="text-xs text-news-muted mb-3">
                  导出 {transactions.length} 条交易记录
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("transactions", "csv")}
                    className="border-news-border hover:bg-news-accent"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport("transactions", "json")}
                    className="border-news-border hover:bg-news-accent"
                  >
                    <FileJson className="w-4 h-4 mr-1" />
                    JSON
                  </Button>
                </div>
              </div>

              {watchlist.some((f) => f.shares && f.costPrice) && (
                <div className="border border-news-border p-4 bg-card">
                  <h3 className="font-['Libre_Baskerville'] font-bold text-news-text mb-3">
                    持仓报告
                  </h3>
                  <p className="text-xs text-news-muted mb-3">
                    导出持仓详情与收益分析
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport("portfolio", "csv")}
                      className="border-news-border hover:bg-news-accent"
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport("portfolio", "json")}
                      className="border-news-border hover:bg-news-accent"
                    >
                      <FileJson className="w-4 h-4 mr-1" />
                      JSON
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-2 border-news-text p-4 bg-news-accent">
                <h3 className="font-['Libre_Baskerville'] font-bold text-news-text mb-3">
                  完整备份
                </h3>
                <p className="text-xs text-news-muted mb-3">
                  导出所有数据（基金、分组、交易、分红），可用于恢复
                </p>
                <Button
                  size="sm"
                  onClick={() => handleExport("all", "json")}
                  className="bg-news-text hover:bg-paper-900"
                >
                  <FileJson className="w-4 h-4 mr-1" />
                  导出备份文件
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={handleImportDialogChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-news-text hover:bg-news-text hover:text-white font-['Source_Sans_3'] text-xs uppercase tracking-[0.15em]"
          >
            <Upload className="w-4 h-4 mr-2" />
            导入数据
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md border-2 border-news-text">
          <DialogHeader>
            <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-news-text">
              导入数据
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={importType === "funds" ? "default" : "outline"}
                onClick={() => setImportType("funds")}
                className={importType === "funds" ? "bg-news-text" : "border-news-border"}
              >
                基金列表
              </Button>
              <Button
                size="sm"
                variant={importType === "transactions" ? "default" : "outline"}
                onClick={() => setImportType("transactions")}
                className={importType === "transactions" ? "bg-news-text" : "border-news-border"}
              >
                交易记录
              </Button>
              <Button
                size="sm"
                variant={importType === "backup" ? "default" : "outline"}
                onClick={() => setImportType("backup")}
                className={importType === "backup" ? "bg-news-text" : "border-news-border"}
              >
                完整备份
              </Button>
            </div>

            <div className="border-2 border-dashed border-news-border p-8 text-center bg-paper-100 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="pointer-events-none">
                <Upload className="w-6 h-6 mx-auto mb-2 text-news-muted" />
                <span className="text-sm text-news-text font-['Source_Sans_3']">
                  点击选择文件
                </span>
                <p className="text-xs text-news-muted mt-2">
                  支持 CSV 或 JSON 格式
                </p>
              </div>
            </div>

            {importResult && (
              <div
                className={`flex items-center gap-2 p-3 ${
                  importResult.success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {importing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : importResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
            )}

            <div className="border border-news-border p-3 bg-news-accent">
              <h4 className="font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.15em] text-news-text mb-2">
                文件格式说明
              </h4>
              {importType === "funds" && (
                <p className="text-xs text-news-muted">
                  CSV 需包含列: code, name, shares(可选), costPrice(可选)
                </p>
              )}
              {importType === "transactions" && (
                <p className="text-xs text-news-muted">
                  CSV 需包含列: fundCode, type, date, shares, price, amount, fee, remark(可选)
                </p>
              )}
              {importType === "backup" && (
                <p className="text-xs text-news-muted">
                  仅支持通过"完整备份"功能导出的 JSON 文件
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
