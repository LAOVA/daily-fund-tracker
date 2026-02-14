"use client";

import { useEffect, useState, memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFundsStore, Fund } from "@/stores/fundsStore";
import { formatPercent, getChangeColor } from "@/lib/utils";
import { fetchFundHoldingsByJsonp, Holding } from "@/lib/useFundData";

// 注册 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FundDetailPanelProps {
  fund: Fund;
  onClose: () => void;
}

// 获取历史净值数据
const fetchFundHistory = async (code: string) => {
  try {
    const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;

    // 动态加载脚本
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

    // 取最近30天的数据
    return trend.slice(-30).map((item: { x: number; y: number }) => ({
      date: new Date(item.x).toLocaleDateString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
      }),
      value: item.y,
    }));
  } catch (error) {
    console.error("获取历史数据失败:", error);
    return [];
  }
};

export const FundDetailPanel = memo(function FundDetailPanel({
  fund,
  onClose,
}: FundDetailPanelProps) {
  const [historyData, setHistoryData] = useState<
    { date: string; value: number }[]
  >([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [history, holdingsData] = await Promise.all([
          fetchFundHistory(fund.code),
          fetchFundHoldingsByJsonp(fund.code),
        ]);
        setHistoryData(history);
        setHoldings(holdingsData?.holdings || []);
      } catch (error) {
        console.error("加载数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fund.code]);

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3 h-3" />;
    if (value < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  // 图表配置
  const chartData = {
    labels: historyData.map((d) => d.date),
    datasets: [
      {
        label: "单位净值",
        data: historyData.map((d) => d.value),
        borderColor: "#C41E3A",
        backgroundColor: "rgba(196, 30, 58, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => `净值: ${context.parsed.y.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
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
        grid: {
          color: "#E5E5E5",
        },
        ticks: {
          font: {
            family: "'JetBrains Mono', monospace",
            size: 10,
          },
          color: "#6B6560",
          callback: (value: any) => value.toFixed(2),
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <tr>
      <td colSpan={9} className="bg-[#FAFAFA] border-b-2 border-[#2D2A26]">
        <div className="p-6">
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#2D2A26] flex items-center justify-center">
                <span className="font-['Newsreader'] text-2xl font-bold text-white">
                  {fund.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-['Newsreader'] text-2xl font-bold text-[#2D2A26]">
                  {fund.name}
                </h3>
                <span className="text-sm text-[#6B6560] font-['JetBrains_Mono']">
                  {fund.code}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#6B6560] hover:text-[#2D2A26] transition-colors"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：净值趋势图 */}
            <div>
              <div className="border-b-2 border-[#2D2A26] pb-2 mb-4">
                <h4 className="font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                  近30日净值走势
                </h4>
              </div>
              <div className="h-64 border border-[#C9C2B5] bg-white p-4 h-72">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-[#6B6560] font-['Source_Sans_3']">
                    加载中...
                  </div>
                ) : historyData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center text-[#6B6560] font-['Source_Sans_3']">
                    暂无历史数据
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：重仓信息 */}
            <div className="flex flex-col">
              <div className="border-b-2 border-[#2D2A26] pb-2 mb-4">
                <h4 className="font-['Source_Sans_3'] text-sm font-bold uppercase tracking-[0.15em] text-[#2D2A26]">
                  重仓股 ({holdings.length}只)
                </h4>
              </div>
              <div className="border border-[#C9C2B5] bg-white h-72 overflow-hidden">
                {loading ? (
                  <div className="h-full flex items-center justify-center text-[#6B6560] font-['Source_Sans_3']">
                    加载中...
                  </div>
                ) : holdings.length > 0 ? (
                  <div className="h-full overflow-y-auto">
                    <table className="w-full">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-[#C9C2B5] bg-[#F5F0E6]">
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
                            className={`border-b border-[#E5E5E5] ${
                              index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#2D2A26] flex items-center justify-center text-white text-xs font-['Newsreader'] font-bold">
                                  {holding.name.charAt(0)}
                                </div>
                                <span className="font-['Libre_Baskerville'] font-bold text-[#2D2A26] text-sm">
                                  {holding.name}
                                </span>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-['JetBrains_Mono'] text-[#8B0000] text-sm">
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
                  <div className="h-full flex items-center justify-center text-[#6B6560] font-['Source_Sans_3']">
                    暂无持仓数据
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
});

