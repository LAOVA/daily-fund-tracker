"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Doughnut } from "react-chartjs-2";
import { useFundsStore } from "@/stores/fundsStore";
import { formatCurrency, cn } from "@/lib/utils";
import { PieChart, TrendingUp, TrendingDown } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioAnalysisProps {
  className?: string;
}

const chartColors = [
  "#C41E3A",
  "#228B22",
  "#1565C0",
  "#E65100",
  "#8B0000",
  "#6B6560",
  "#2D2A26",
  "#C9C2B5",
  "#F5F0E6",
  "#FAFAFA",
];

export function PortfolioAnalysis({ className }: PortfolioAnalysisProps) {
  const { watchlist } = useFundsStore();

  const portfolioData = useMemo(() => {
    const fundsWithPosition = watchlist.filter(
      (f) => f.shares && f.costPrice && f.shares > 0 && f.costPrice > 0
    );

    if (fundsWithPosition.length === 0) {
      return null;
    }

    const totalCost = fundsWithPosition.reduce(
      (sum, f) => sum + (f.shares || 0) * (f.costPrice || 0),
      0
    );

    const totalMarketValue = fundsWithPosition.reduce(
      (sum, f) => sum + (f.shares || 0) * (f.estimatedNetValue || 0),
      0
    );

    const totalProfit = totalMarketValue - totalCost;

    const holdingsDistribution = fundsWithPosition.map((f, index) => ({
      name: f.name,
      code: f.code,
      cost: (f.shares || 0) * (f.costPrice || 0),
      marketValue: (f.shares || 0) * (f.estimatedNetValue || 0),
      profit: (f.shares || 0) * ((f.estimatedNetValue || 0) - (f.costPrice || 0)),
      profitPercent: f.costPrice && f.costPrice > 0
        ? ((f.estimatedNetValue || 0) - f.costPrice) / f.costPrice * 100
        : 0,
      color: chartColors[index % chartColors.length],
    }));

    holdingsDistribution.sort((a, b) => b.cost - a.cost);

    return {
      totalCost,
      totalMarketValue,
      totalProfit,
      totalProfitPercent: totalCost > 0 ? (totalProfit / totalCost) * 100 : 0,
      holdingsDistribution,
      fundCount: fundsWithPosition.length,
    };
  }, [watchlist]);

  const costChartData = useMemo(() => {
    if (!portfolioData) return null;

    return {
      labels: portfolioData.holdingsDistribution.map((h) => h.name),
      datasets: [
        {
          data: portfolioData.holdingsDistribution.map((h) => h.cost),
          backgroundColor: portfolioData.holdingsDistribution.map((h) => h.color),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [portfolioData]);

  const profitChartData = useMemo(() => {
    if (!portfolioData) return null;

    return {
      labels: portfolioData.holdingsDistribution.map((h) => h.name),
      datasets: [
        {
          data: portfolioData.holdingsDistribution.map((h) => Math.abs(h.profit)),
          backgroundColor: portfolioData.holdingsDistribution.map((h, i) =>
            h.profit >= 0 ? chartColors[i % chartColors.length] : "#228B22"
          ),
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  }, [portfolioData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(45, 42, 38, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#C9C2B5",
        borderWidth: 1,
        padding: 12,
        titleFont: {
          family: "'Source Sans 3', sans-serif",
          size: 12,
        },
        bodyFont: {
          family: "'JetBrains Mono', monospace",
          size: 12,
        },
        callbacks: {
          label: (context: { parsed: number; label: string; dataset: { data: number[] } }) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${formatCurrency(value, false)} (${percent}%)`;
          },
        },
      },
    },
  };

  if (!portfolioData) {
    return (
      <div className={cn("bg-white border border-news-border p-6", className)}>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-news-muted" />
          <h3 className="font-['Newsreader'] text-xl font-bold text-news-text">
            组合分析
          </h3>
        </div>
        <div className="h-48 flex items-center justify-center text-news-muted font-['Source_Sans_3'] border border-dashed border-news-border rounded-lg">
          请先添加持仓信息以查看组合分析
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-news-border p-6", className)}>
      <div className="flex items-center gap-2 mb-6">
        <PieChart className="w-5 h-5 text-news-muted" />
        <h3 className="font-['Newsreader'] text-xl font-bold text-news-text">
          组合分析
        </h3>
        <span className="text-xs text-news-muted ml-2">
          ({portfolioData.fundCount}只基金)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-bold text-news-text mb-3 font-['Source_Sans_3'] uppercase tracking-wider">
            成本分布
          </h4>
          <div className="h-48">
            {costChartData && <Pie data={costChartData} options={chartOptions} />}
          </div>
          <div className="mt-4 space-y-2">
            {portfolioData.holdingsDistribution.slice(0, 5).map((h) => (
              <div key={h.code} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: h.color }}
                  />
                  <span className="text-news-text font-['Libre_Baskerville'] truncate max-w-[120px]">
                    {h.name}
                  </span>
                </div>
                <span className="font-['JetBrains_Mono'] text-news-muted">
                  {((h.cost / portfolioData.totalCost) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-news-text mb-3 font-['Source_Sans_3'] uppercase tracking-wider">
            收益贡献
          </h4>
          <div className="h-48">
            {profitChartData && <Doughnut data={profitChartData} options={chartOptions} />}
          </div>
          <div className="mt-4 space-y-2">
            {portfolioData.holdingsDistribution
              .sort((a, b) => b.profit - a.profit)
              .slice(0, 5)
              .map((h, i) => (
                <div key={h.code} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: chartColors[i % chartColors.length] }}
                    />
                    <span className="text-news-text font-['Libre_Baskerville'] truncate max-w-[120px]">
                      {h.name}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "font-['JetBrains_Mono'] font-bold",
                      h.profit >= 0 ? "text-finance-rise" : "text-finance-fall"
                    )}
                  >
                    {h.profit >= 0 ? "+" : ""}{formatCurrency(h.profit)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-news-border">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-news-muted font-['Source_Sans_3'] mb-1">
              总成本
            </div>
            <div className="font-['JetBrains_Mono'] font-bold text-news-text">
              {formatCurrency(portfolioData.totalCost, false)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-news-muted font-['Source_Sans_3'] mb-1">
              总市值
            </div>
            <div className="font-['JetBrains_Mono'] font-bold text-news-text">
              {formatCurrency(portfolioData.totalMarketValue, false)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-news-muted font-['Source_Sans_3'] mb-1">
              总收益
            </div>
            <div
              className={cn(
                "font-['JetBrains_Mono'] font-bold flex items-center justify-center gap-1",
                portfolioData.totalProfit >= 0 ? "text-finance-rise" : "text-finance-fall"
              )}
            >
              {portfolioData.totalProfit >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {formatCurrency(portfolioData.totalProfit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
