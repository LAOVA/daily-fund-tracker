"use client";

import { useState, useMemo } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { cn } from "@/lib/utils";
import { Fund, NavRecord } from "@/stores/fundsStore";
import { useFundsStore } from "@/stores/fundsStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyProfitCalendarProps {
  fund: Fund;
  currentDay?: number;
  currentMonth?: number;
  currentYear?: number;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function DailyProfitCalendar({
  fund,
  currentDay = new Date().getDate(),
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
}: DailyProfitCalendarProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [viewMode, setViewMode] = useState<"calendar" | "chart">("calendar");
  const [timeGranularity, setTimeGranularity] = useState<"day" | "week" | "month" | "year">("day");
  const [unit, setUnit] = useState<"currency" | "percent">("currency");

  const transactions = useFundsStore((state) => state.transactions);

  const fundTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.fundCode === fund.code)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, fund.code]);

  const firstBuyDate = useMemo(() => {
    const buyTransactions = fundTransactions.filter((t) => t.type === "buy");
    return buyTransactions.length > 0 ? buyTransactions[0].date : null;
  }, [fundTransactions]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth - 1, 1).getDay();
  }, [selectedYear, selectedMonth]);

  const dailyProfitData = useMemo(() => {
    const navHistory = fund.navHistory || [];
    
    if (navHistory.length === 0 || fundTransactions.length === 0) {
      return [];
    }

    const sortedNav = [...navHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const navMap = new Map<string, number>();
    sortedNav.forEach((nav) => navMap.set(nav.date, nav.nav));

    let dates = Array.from(navMap.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (firstBuyDate) {
      const purchaseTime = new Date(firstBuyDate).getTime();
      dates = dates.filter((d) => new Date(d).getTime() >= purchaseTime);
    }

    const dateSet = new Set(dates);

    const sharesMap = new Map<string, number>();
    let currentShares = 0;
    
    for (const navDate of dates) {
      const dayTxns = fundTransactions.filter((t) => {
        const txnDate = new Date(t.date);
        const navDt = new Date(navDate);
        return txnDate.getTime() <= navDt.getTime();
      });
      
      currentShares = 0;
      dayTxns.forEach((t) => {
        if (t.type === "buy") {
          currentShares += t.shares;
        } else if (t.type === "sell") {
          currentShares -= t.shares;
        }
      });
      
      sharesMap.set(navDate, currentShares);
    }

    const data: { date: number; profit: number }[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const currentNav = navMap.get(dayStr);
      
      if (currentNav && currentNav > 0 && dateSet.has(dayStr)) {
        const sortedDates = Array.from(navMap.keys()).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );
        const currentIndex = sortedDates.indexOf(dayStr);
        
        if (currentIndex > 0) {
          const prevDate = sortedDates[currentIndex - 1];
          const prevNav = navMap.get(prevDate);
          const currentShares = sharesMap.get(dayStr) || 0;
          
          if (prevNav && prevNav > 0 && currentShares > 0) {
            const profit = (currentNav - prevNav) * currentShares;
            data.push({ date: day, profit });
          } else {
            data.push({ date: day, profit: 0 });
          }
        } else {
          data.push({ date: day, profit: 0 });
        }
      } else {
        data.push({ date: day, profit: 0 });
      }
    }

    return data;
  }, [fund.navHistory, selectedYear, selectedMonth, daysInMonth, fundTransactions, firstBuyDate]);

  const calendarDays = useMemo(() => {
    const days: { date: number; profit: number }[] = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ date: 0, profit: 0 });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = dailyProfitData.find((d) => d.date === day);
      days.push(dayData || { date: day, profit: 0 });
    }
    
    while (days.length % 7 !== 0) {
      days.push({ date: 0, profit: 0 });
    }
    
    return days;
  }, [daysInMonth, firstDayOfMonth, dailyProfitData]);

  const getProfitColor = (profit: number, isToday: boolean, hasData: boolean) => {
    if (!hasData || profit === 0) {
      return "bg-paper-200 text-news-muted";
    }
    if (profit < 0) {
      return "bg-finance-fall/20 text-finance-fall";
    }
    return "bg-finance-rise/20 text-finance-rise";
  };

  const formatProfit = (profit: number) => {
    if (profit === 0) return "0.00";
    const prefix = profit > 0 ? "+" : "";
    return `${prefix}${profit.toFixed(2)}`;
  };

  const formatProfitPercent = (profit: number) => {
    if (!fund.costPrice || fund.costPrice === 0 || profit === 0) {
      return "0.00%";
    }
    const percent = (profit / (fund.costPrice * (fund.shares || 1))) * 100;
    const prefix = percent > 0 ? "+" : "";
    return `${prefix}${percent.toFixed(2)}%`;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const totalProfit = useMemo(() => {
    return dailyProfitData.reduce((sum, d) => sum + d.profit, 0);
  }, [dailyProfitData]);

  const aggregatedData = useMemo(() => {
    const navHistory = fund.navHistory || [];
    
    if (navHistory.length === 0 || fundTransactions.length === 0) {
      return [];
    }

    const sortedNav = [...navHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const navMap = new Map<string, number>();
    sortedNav.forEach((nav) => navMap.set(nav.date, nav.nav));

    let dates = Array.from(navMap.keys()).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (firstBuyDate) {
      const purchaseTime = new Date(firstBuyDate).getTime();
      dates = dates.filter((d) => new Date(d).getTime() >= purchaseTime);
    }

    const sharesMap = new Map<string, number>();
    let currentShares = 0;
    
    for (const navDate of dates) {
      const dayTxns = fundTransactions.filter((t) => {
        const txnDate = new Date(t.date);
        const navDt = new Date(navDate);
        return txnDate.getTime() <= navDt.getTime();
      });
      
      currentShares = 0;
      dayTxns.forEach((t) => {
        if (t.type === "buy") {
          currentShares += t.shares;
        } else if (t.type === "sell") {
          currentShares -= t.shares;
        }
      });
      
      sharesMap.set(navDate, currentShares);
    }

    const dailyProfits: { date: string; profit: number }[] = [];

    for (let i = 1; i < dates.length; i++) {
      const currentNav = navMap.get(dates[i]);
      const prevNav = navMap.get(dates[i - 1]);
      const currentShares = sharesMap.get(dates[i]) || 0;
      if (currentNav && prevNav && currentNav > 0 && prevNav > 0 && currentShares > 0) {
        dailyProfits.push({
          date: dates[i],
          profit: (currentNav - prevNav) * currentShares,
        });
      }
    }

    if (timeGranularity === "day") {
      return dailyProfits.slice(-30);
    }

    const grouped: Record<string, number> = {};
    
    dailyProfits.forEach((item) => {
      const date = new Date(item.date);
      let key: string;
      
      if (timeGranularity === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (timeGranularity === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = String(date.getFullYear());
      }
      
      grouped[key] = (grouped[key] || 0) + item.profit;
    });

    return Object.entries(grouped)
      .map(([date, profit]) => ({ date, profit }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12);
  }, [fund.navHistory, fundTransactions, firstBuyDate, timeGranularity]);

  const chartData = useMemo(() => {
    const labels = aggregatedData.map((d) => {
      if (timeGranularity === "month") {
        const [year, month] = d.date.split("-");
        return `${month}月`;
      } else if (timeGranularity === "year") {
        return `${d.date}年`;
      } else {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
    });

    const costBasis = (fund.costPrice || 0) * (fund.shares || 1);
    const data = aggregatedData.map((d) => {
      if (unit === "percent" && costBasis > 0) {
        return (d.profit / costBasis) * 100;
      }
      return d.profit;
    });
    
    const isPositive = data.every((v) => v >= 0);
    const isNegative = data.every((v) => v <= 0);
    const baseColor = isPositive ? "#22c55e" : isNegative ? "#ef4444" : "#3b82f6";

    return {
      labels,
      datasets: [
        {
          label: unit === "currency" ? "盈亏 (元)" : "盈亏 (%)",
          data,
          borderColor: baseColor,
          backgroundColor: `${baseColor}20`,
          fill: true,
          tension: 0.3,
        },
      ],
    };
  }, [aggregatedData, timeGranularity, unit, fund.costPrice, fund.shares]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const prefix = value >= 0 ? "+" : "";
            if (unit === "currency") {
              return `${prefix}${value.toFixed(2)} 元`;
            }
            return `${prefix}${value.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
        },
      },
      y: {
        grid: {
          color: "#e5e7eb",
        },
        ticks: {
          color: "#6b7280",
          callback: (value: any) => {
            if (unit === "currency") {
              return `¥${value}`;
            }
            return `${Number(value).toFixed(2)}%`;
          },
        },
      },
    },
  }), [unit, fund.costPrice, fund.shares]);

  const hasNavHistory = (fund.navHistory && fund.navHistory.length > 0) || false;
  const hasPosition = (fund.shares && fund.shares > 0 && fund.costPrice) || false;

  if (!hasPosition) {
    return (
      <div className="border border-news-border bg-card rounded-lg p-6 text-center">
        <p className="text-news-muted font-['Source_Sans_3']">
          暂无持仓，无法显示每日盈亏
        </p>
      </div>
    );
  }

  if (!hasNavHistory) {
    return (
      <div className="border border-news-border bg-card rounded-lg p-6 text-center">
        <p className="text-news-muted font-['Source_Sans_3']">
          暂无历史净值数据，正在获取...
        </p>
      </div>
    );
  }

  return (
    <div className="border border-news-border bg-card rounded-lg overflow-hidden">
      <div className="bg-paper-100 border-b border-news-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("calendar")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "calendar"
                  ? "bg-news-text text-white"
                  : "bg-paper-200 text-news-muted hover:bg-paper-300"
              )}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("chart")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "chart"
                  ? "bg-news-text text-white"
                  : "bg-paper-200 text-news-muted hover:bg-paper-300"
              )}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>

          {viewMode === "chart" && (
            <div className="flex items-center gap-1 bg-paper-200 rounded-md p-1">
              {(["day", "week", "month", "year"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setTimeGranularity(g)}
                  className={cn(
                    "px-3 py-1 text-xs font-['Source_Sans_3'] rounded-md transition-colors",
                    timeGranularity === g
                      ? "bg-news-text text-white"
                      : "text-news-muted hover:text-news-text"
                  )}
                >
                  {g === "day" ? "日" : g === "week" ? "周" : g === "month" ? "月" : "年"}
                </button>
              ))}
            </div>
          )}

          {viewMode === "calendar" && <div />}

          <div className="flex items-center gap-1 bg-paper-200 rounded-md p-1">
            <button
              onClick={() => setUnit("currency")}
              className={cn(
                "px-3 py-1 text-xs font-['Source_Sans_3'] rounded-md transition-colors",
                unit === "currency"
                  ? "bg-news-text text-white"
                  : "text-news-muted hover:text-news-text"
              )}
            >
              ¥
            </button>
            <button
              onClick={() => setUnit("percent")}
              className={cn(
                "px-3 py-1 text-xs font-['Source_Sans_3'] rounded-md transition-colors",
                unit === "percent"
                  ? "bg-news-text text-white"
                  : "text-news-muted hover:text-news-text"
              )}
            >
              %
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {viewMode === "chart" ? (
            <div className="font-['Newsreader'] text-lg font-bold text-news-text">
              {timeGranularity === "day" ? "近30日盈亏" : 
               timeGranularity === "week" ? "近12周盈亏" : 
               timeGranularity === "month" ? "近12月盈亏" : "近年盈亏"}
            </div>
          ) : (
            <>
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-paper-200 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-news-text" />
              </button>
              <div className="font-['Newsreader'] text-lg font-bold text-news-text">
                {selectedYear}年 {selectedMonth}月
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-paper-200 rounded-md transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-news-text" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        {viewMode === "chart" ? (
          <div className="h-[300px]">
            {aggregatedData.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-news-muted">
                暂无数据
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-['Source_Sans_3'] text-news-muted">
                本月累计收益
              </div>
              <div
                className={cn(
                  "font-['JetBrains_Mono'] text-lg font-bold",
                  totalProfit >= 0 ? "text-finance-rise" : "text-finance-fall"
                )}
              >
                {unit === "currency"
                  ? `${totalProfit >= 0 ? "+" : ""}${totalProfit.toLocaleString("zh-CN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : formatProfitPercent(totalProfit)}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-['Source_Sans_3'] text-news-muted py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => {
                if (dayData.date === 0) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const isToday =
                  dayData.date === currentDay &&
                  selectedMonth === currentMonth &&
                  selectedYear === currentYear;

                const hasData = dayData.profit !== 0;

                return (
                  <div
                    key={dayData.date}
                    className={cn(
                      "aspect-square rounded-md p-1 flex flex-col items-center justify-center relative transition-all hover:scale-105 cursor-pointer",
                      getProfitColor(dayData.profit, isToday, hasData),
                      isToday ? "ring-2 ring-finance-fall" : ""
                    )}
                  >
                    <div className="text-xs font-['JetBrains_Mono'] text-news-text font-bold">
                      {dayData.date}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-['JetBrains_Mono']",
                        !hasData ? "text-news-muted" : ""
                      )}
                    >
                      {unit === "currency"
                        ? formatProfit(dayData.profit)
                        : formatProfitPercent(dayData.profit)}
                    </div>
                    {isToday && (
                      <div className="absolute -top-1 -right-1 bg-finance-fall text-white text-[8px] font-bold px-1 rounded">
                        今
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-6 text-xs font-['Source_Sans_3']">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-finance-rise/20" />
                <span className="text-news-muted">盈利</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-finance-fall/20" />
                <span className="text-news-muted">亏损</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-paper-200" />
                <span className="text-news-muted">无交易</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
