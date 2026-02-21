import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Fund {
  /** 基金代码 */
  code: string;
  /** 基金名称 */
  name: string;
  /** 最新净值 */
  netAssetValue?: number;
  /** 昨日净值 */
  previousNetAssetValue?: number;
  /** 估算净值（实时） */
  estimatedNetValue?: number;
  /** 估算涨跌幅（实时，百分比） */
  estimatedGrowthRate?: number;
  /** 昨日涨跌幅（百分比） */
  yesterdayChange?: number;
  /** 累计净值 */
  totalNetValue?: number;
  /** 日涨跌幅 */
  dailyGrowthRate?: number;
  /** 近一周涨跌幅 */
  lastWeekGrowthRate?: number;
  /** 近一月涨跌幅 */
  lastMonthGrowthRate?: number;
  /** 今年以来涨跌幅 */
  thisYearGrowthRate?: number;
  /** 数据更新时间 */
  updateTime?: string;
  /** 持有份额 */
  shares?: number;
  /** 成本价（单位净值） */
  costPrice?: number;
  /** 总投入成本 */
  costAmount?: number;
}

export interface FundGroup {
  id: string;
  name: string;
  funds: string[];
}

export type TransactionType = "buy" | "sell" | "dividend";

export interface Transaction {
  id: string;
  fundCode: string;
  type: TransactionType;
  date: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  remark?: string;
}

export interface DividendRecord {
  id: string;
  fundCode: string;
  date: string;
  amountPerShare: number;
  totalShares: number;
  totalAmount: number;
  reinvest: boolean;
}

interface FundsState {
  watchlist: Fund[];
  groups: FundGroup[];
  transactions: Transaction[];
  dividends: DividendRecord[];
  addFund: (fund: Fund, groupId?: string) => void;
  removeFund: (code: string) => void;
  updateFund: (code: string, data: Partial<Fund>) => void;
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  addFundToGroup: (fundCode: string, groupId: string) => void;
  removeFundFromGroup: (fundCode: string, groupId: string) => void;
  setFundPosition: (code: string, shares: number, costPrice: number) => void;
  removeFundPosition: (code: string) => void;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  addDividend: (dividend: Omit<DividendRecord, "id">) => void;
  removeDividend: (id: string) => void;
  recalculatePosition: (fundCode: string) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useFundsStore = create<FundsState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      groups: [
        {
          id: "default",
          name: "默认分组",
          funds: [],
        },
      ],
      transactions: [],
      dividends: [],

      addFund: (fund: Fund, groupId?: string) =>
        set((state) => {
          const exists = state.watchlist.some((f) => f.code === fund.code);
          if (exists) return state;

          const newWatchlist = [...state.watchlist, fund];
          const targetGroupId = groupId || "default";

          return {
            watchlist: newWatchlist,
            groups: state.groups.map((g) =>
              g.id === targetGroupId && !g.funds.includes(fund.code)
                ? { ...g, funds: [...g.funds, fund.code] }
                : g
            ),
          };
        }),

      removeFund: (code: string) =>
        set((state) => ({
          watchlist: state.watchlist.filter((f) => f.code !== code),
          groups: state.groups.map((g) => ({
            ...g,
            funds: g.funds.filter((c) => c !== code),
          })),
          transactions: state.transactions.filter((t) => t.fundCode !== code),
          dividends: state.dividends.filter((d) => d.fundCode !== code),
        })),

      updateFund: (code: string, data: Partial<Fund>) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) => {
            if (f.code !== code) return f;
            const updates: Partial<Fund> = {};
            (Object.keys(data) as Array<keyof Fund>).forEach((key) => {
              const value = data[key];
              if (value !== undefined && value !== null) {
                updates[key] = value as never;
              }
            });
            return { ...f, ...updates };
          }),
        })),

      addGroup: (name: string) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              id: `group-${Date.now()}`,
              name,
              funds: [],
            },
          ],
        })),

      removeGroup: (id: string) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addFundToGroup: (fundCode: string, groupId: string) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId && !g.funds.includes(fundCode)
              ? { ...g, funds: [...g.funds, fundCode] }
              : g
          ),
        })),

      removeFundFromGroup: (fundCode: string, groupId: string) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, funds: g.funds.filter((c) => c !== fundCode) }
              : g
          ),
        })),

      setFundPosition: (code: string, shares: number, costPrice: number) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code
              ? {
                  ...f,
                  shares,
                  costPrice,
                  costAmount: shares * costPrice,
                }
              : f
          ),
        })),

      removeFundPosition: (code: string) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code
              ? { ...f, shares: undefined, costPrice: undefined, costAmount: undefined }
              : f
          ),
        })),

      addTransaction: (transaction: Omit<Transaction, "id">) =>
        set((state) => {
          const newTransaction: Transaction = {
            ...transaction,
            id: generateId(),
          };
          const newState = {
            ...state,
            transactions: [...state.transactions, newTransaction].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
          return newState;
        }),

      updateTransaction: (id: string, data: Partial<Transaction>) =>
        set((state) => ({
          transactions: state.transactions
            .map((t) => (t.id === id ? { ...t, ...data } : t))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),

      removeTransaction: (id: string) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addDividend: (dividend: Omit<DividendRecord, "id">) =>
        set((state) => {
          const newDividend: DividendRecord = {
            ...dividend,
            id: generateId(),
          };
          return {
            dividends: [...state.dividends, newDividend].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        }),

      removeDividend: (id: string) =>
        set((state) => ({
          dividends: state.dividends.filter((d) => d.id !== id),
        })),

      recalculatePosition: (fundCode: string) => {
        const state = get();
        const fundTransactions = state.transactions.filter(
          (t) => t.fundCode === fundCode
        );

        let totalShares = 0;
        let totalCost = 0;

        fundTransactions.forEach((t) => {
          if (t.type === "buy") {
            totalShares += t.shares;
            totalCost += t.amount + t.fee;
          } else if (t.type === "sell") {
            const sellRatio = t.shares / totalShares;
            totalCost -= totalCost * sellRatio;
            totalShares -= t.shares;
          }
        });

        state.dividends
          .filter((d) => d.fundCode === fundCode)
          .forEach((d) => {
            if (d.reinvest) {
              totalShares += d.totalAmount / 1;
            }
          });

        const avgCostPrice = totalShares > 0 ? totalCost / totalShares : 0;

        set((s) => ({
          watchlist: s.watchlist.map((f) =>
            f.code === fundCode
              ? {
                  ...f,
                  shares: totalShares > 0 ? totalShares : undefined,
                  costPrice: avgCostPrice > 0 ? avgCostPrice : undefined,
                  costAmount: totalCost > 0 ? totalCost : undefined,
                }
              : f
          ),
        }));
      },
    }),
    {
      name: "fund-tracker-storage",
    }
  )
);

export function calculatePositionFromTransactions(
  transactions: Transaction[],
  dividends: DividendRecord[],
  fundCode: string
): { shares: number; costPrice: number; costAmount: number } {
  const fundTransactions = transactions.filter((t) => t.fundCode === fundCode);
  const fundDividends = dividends.filter((d) => d.fundCode === fundCode);

  let totalShares = 0;
  let totalCost = 0;

  const sortedTransactions = [...fundTransactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  sortedTransactions.forEach((t) => {
    if (t.type === "buy") {
      totalShares += t.shares;
      totalCost += t.amount + t.fee;
    } else if (t.type === "sell") {
      if (totalShares > 0) {
        const sellRatio = t.shares / totalShares;
        totalCost -= totalCost * sellRatio;
        totalShares -= t.shares;
        if (totalShares < 0) totalShares = 0;
      }
    }
  });

  fundDividends.forEach((d) => {
    if (d.reinvest && d.totalAmount > 0) {
    }
  });

  const avgCostPrice = totalShares > 0 ? totalCost / totalShares : 0;

  return {
    shares: totalShares,
    costPrice: avgCostPrice,
    costAmount: totalCost,
  };
}
