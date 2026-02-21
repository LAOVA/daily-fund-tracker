"use client";

import { useEffect, useState, memo, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Fund } from "@/stores/fundsStore";
import { getChangeColor } from "@/lib/utils";
import { fetchFundHoldingsByJsonp, Holding } from "@/lib/useFundData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface FundDetailPanelProps {
  fund: Fund;
  onClose: () => void;
  variant?: "table" | "card";
}

type TimePeriod = "1m" | "3m" | "6m" | "1y" | "all";

const timePeriodConfig: Record<TimePeriod, { label: string; days: number }> = {
  "1m": { label: "近1月", days: 30 },
  "3m": { label: "近3月", days: 90 },
  "6m": { label: "近6月", days: 180 },
  "1y": { label: "近1年", days: 365 },
  all: { label: "全部", days: 0 },
};

interface HistoryDataPoint {
  date: string;
  value: number;
  fullDate: string;
}

const fetchFundHistory = async (code: string): Promise<HistoryDataPoint[]> => {
  try {
    const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = pingUrl;
      script.async = true;
      script.onload = () => {
        setTimeout(() => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
          resolve();
        }, 200);
      };
      script.onerror = () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        reject(new Error("加载失败"));
      };
      document.body.appendChild(script);
    });

    const trend = (window as any).Data_netWorthTrend;
    if (!Array.isArray(trend)) return [];

    return trend.map((item: { x: number; y: number }) => {
      const date = new Date(item.x);
      return {
        date: date.toLocaleDateString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
        }),
        value: item.y,
        fullDate: date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      };
    });
  } catch (error) {
    console.error("获取历史数据失败:", error);
    return [];
  }
};

export const FundDetailPanel = memo(function FundDetailPanel({
  fund,
  onClose,
  variant = "table",
}: FundDetailPanelProps) {
  const [allHistoryData, setAllHistoryData] = useState<HistoryDataPoint[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [hasHoldingsData, setHasHoldingsData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("1m");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [history, holdingsData] = await Promise.all([
          fetchFundHistory(fund.code),
          fetchFundHoldingsByJsonp(fund.code),
        ]);
        setAllHistoryData(history);
        setHoldings(holdingsData?.holdings || []);
        setHasHoldingsData(holdingsData?.hasData ?? true);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fund.code]);

  const historyData = useMemo(() => {
    if (selectedPeriod === "all") return allHistoryData;
    const days = timePeriodConfig[selectedPeriod].days;
    return allHistoryData.slice(-days);
  }, [allHistoryData, selectedPeriod]);

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />;
    if (value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const chartData = useMemo(
    () => ({
      labels: historyData.map((d) => d.date),
      datasets: [
        {
          label: "单位净值",
          data: historyData.map((d) => d.value),
          borderColor: "#C41E3A",
          backgroundColor: (context: { chart: ChartJS; dataIndex: number }) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, "rgba(196, 30, 58, 0.15)");
            gradient.addColorStop(1, "rgba(196, 30, 58, 0.02)");
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "#C41E3A",
          pointHoverBorderColor: "#fff",
          pointHoverBorderWidth: 2,
          tension: 0.2,
          fill: true,
        },
      ],
    }),
    [historyData]
  );

  const chartOptions = useMemo(() => {
    const values = historyData.map((d) => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.1;

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 300,
      } as const,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "index" as const,
          intersect: false,
          backgroundColor: "rgba(45, 42, 38, 0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderColor: "#C9C2B5",
          borderWidth: 1,
          padding: 12,
          titleFont: {
            family: "'Source Sans 3', sans-serif",
            size: 12,
            weight: 600,
          },
          bodyFont: {
            family: "'JetBrains Mono', monospace",
            size: 14,
            weight: 700,
          },
          displayColors: false,
          callbacks: {
            title: (items: { dataIndex: number }[]) => {
              const idx = items[0]?.dataIndex;
              if (idx !== undefined && historyData[idx]) {
                return historyData[idx].fullDate;
              }
              return "";
            },
            label: (context: { parsed: { y: number | null } }) => {
              const value = context.parsed.y;
              return `净值: ${value !== null ? value.toFixed(4) : "-"}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 6,
            font: {
              family: "'JetBrains Mono', monospace",
              size: 10,
            },
            color: "#6B6560",
          },
        },
        y: {
          min: Math.max(0, minValue - padding),
          max: maxValue + padding,
          grid: {
            color: "rgba(229, 229, 229, 0.5)",
            drawBorder: false,
          },
          border: {
            display: false,
          },
          ticks: {
            font: {
              family: "'JetBrains Mono', monospace",
              size: 10,
            },
            color: "#6B6560",
            padding: 8,
            callback: (value: string | number) => Number(value).toFixed(4),
          },
        },
      },
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      elements: {
        line: {
          capBezierPoints: true,
        },
        point: {
          hoverRadius: 6,
        },
      },
    };
  }, [historyData]);

  const periodButtons: TimePeriod[] = ["1m", "3m", "6m", "1y", "all"];

  const content = (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-news-text dark:bg-paper-100 flex items-center justify-center">
            <span className="font-['Newsreader'] text-lg sm:text-2xl font-bold text-white">
              {fund.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-['Newsreader'] text-xl sm:text-2xl font-bold text-news-text">
              {fund.name}
            </h3>
            <span className="text-sm text-news-muted font-['JetBrains_Mono']">
              {fund.code}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-news-muted hover:text-news-text transition-colors"
        >
          <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <div>
          <div className="flex items-center justify-between border-b-2 border-news-text pb-2 mb-4">
            <h4 className="font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.15em] text-news-text">
              净值走势
            </h4>
            <div className="flex gap-1">
              {periodButtons.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-2 py-1 text-xs font-['Source_Sans_3'] rounded transition-colors ${
                    selectedPeriod === period
                      ? "bg-news-text dark:bg-paper-100 text-white"
                      : "text-news-muted hover:text-news-text hover:bg-paper-200"
                  }`}
                >
                  {timePeriodConfig[period].label}
                </button>
              ))}
            </div>
          </div>
          <div className="border border-news-border bg-card p-4 h-64 sm:h-72 relative">
            {loading ? (
              <Loading />
            ) : historyData.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-news-muted font-['Source_Sans_3']">
                暂无历史数据
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="border-b-2 border-news-text pb-2 mb-4">
            <h4 className="font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.15em] text-news-text">
              重仓股 {hasHoldingsData ? `(${holdings.length}只)` : ""}
            </h4>
          </div>
          <div className="border border-news-border bg-card h-64 sm:h-72 overflow-hidden">
            {loading ? (
              <Loading />
            ) : hasHoldingsData && holdings.length > 0 ? (
              <div className="h-full overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-news-border bg-news-accent">
                      <th className="text-left py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.1em]">
                        股票名称
                      </th>
                      <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.1em]">
                        持仓比例
                      </th>
                      <th className="text-right py-3 px-4 font-['Source_Sans_3'] text-xs font-bold uppercase tracking-[0.1em]">
                        今日涨跌
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr
                        key={holding.code}
                        className={`border-b border-paper-300 ${
                          index % 2 === 0 ? "bg-card" : "bg-paper-100"
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-news-text dark:bg-paper-100 flex items-center justify-center text-white text-xs font-['Newsreader'] font-bold">
                              {holding.name.charAt(0)}
                            </div>
                            <span className="font-['Libre_Baskerville'] font-bold text-news-text text-sm">
                              {holding.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-['JetBrains_Mono'] text-finance-highlight text-sm">
                          {holding.ratio}%
                        </td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`font-['JetBrains_Mono'] text-sm font-bold flex items-center justify-end gap-1 ${getChangeColor(
                              holding.change || 0
                            )}`}
                          >
                            {getChangeIcon(holding.change || 0)}
                            {holding.change !== undefined ? (
                              <>
                                {holding.change > 0 ? "+" : ""}
                                {holding.change.toFixed(2)}%
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-news-muted font-['Source_Sans_3']">
                <p>暂无重仓股数据</p>
                <p className="text-xs mt-1 text-news-muted/70">
                  可能是新发基金或货币/债券型基金
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "card") {
    return (
      <div className="border border-news-text bg-paper-100 mb-3">{content}</div>
    );
  }

  return (
    <tr>
      <td colSpan={9} className="bg-paper-100 border-b-2 border-news-text">
        {content}
      </td>
    </tr>
  );
});

