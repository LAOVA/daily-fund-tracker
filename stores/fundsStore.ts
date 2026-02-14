import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Fund {
  code: string;
  name: string;
  netAssetValue?: number; // 单位净值（昨日净值）
  previousNetAssetValue?: number; // 昨日净值
  estimatedNetValue?: number; // 估值净值
  estimatedGrowthRate?: number; // 估值涨跌幅
  yesterdayChange?: number; // 昨日涨幅
  totalNetValue?: number;
  dailyGrowthRate?: number;
  lastWeekGrowthRate?: number;
  lastMonthGrowthRate?: number;
  thisYearGrowthRate?: number;
  updateTime?: string;
}

export interface FundGroup {
  id: string;
  name: string;
  funds: string[];
}

interface FundsState {
  watchlist: Fund[];
  groups: FundGroup[];
  addFund: (fund: Fund) => void;
  removeFund: (code: string) => void;
  updateFund: (code: string, data: Partial<Fund>) => void;
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  addFundToGroup: (fundCode: string, groupId: string) => void;
  removeFundFromGroup: (fundCode: string, groupId: string) => void;
}

export const useFundsStore = create<FundsState>()(
  persist(
    (set: (fn: (state: FundsState) => Partial<FundsState> | FundsState) => void, _get: () => FundsState) => ({
      watchlist: [],
      groups: [
        {
          id: "default",
          name: "默认分组",
          funds: [],
        },
      ],

      addFund: (fund: Fund) =>
        set((state: FundsState) => {
          const exists = state.watchlist.some((f: Fund) => f.code === fund.code);
          if (exists) return state;

          const newWatchlist = [...state.watchlist, fund];
          const defaultGroup = state.groups.find((g: FundGroup) => g.id === "default");

          if (defaultGroup) {
            return {
              watchlist: newWatchlist,
              groups: state.groups.map((g: FundGroup) =>
                g.id === "default"
                  ? { ...g, funds: [...g.funds, fund.code] }
                  : g
              ),
            };
          }

          return { watchlist: newWatchlist };
        }),

      removeFund: (code: string) =>
        set((state: FundsState) => ({
          watchlist: state.watchlist.filter((f: Fund) => f.code !== code),
          groups: state.groups.map((g: FundGroup) => ({
            ...g,
            funds: g.funds.filter((c: string) => c !== code),
          })),
        })),

      updateFund: (code: string, data: Partial<Fund>) =>
        set((state: FundsState) => ({
          watchlist: state.watchlist.map((f: Fund) => {
            if (f.code !== code) return f;
            // 只更新有定义的值，避免 undefined 覆盖已有数据
            const updates: Partial<Fund> = {};
            (Object.keys(data) as Array<keyof Fund>).forEach((key) => {
              const value = data[key];
              if (value !== undefined && value !== null) {
                updates[key] = value as any;
              }
            });
            return { ...f, ...updates };
          }),
        })),

      addGroup: (name: string) =>
        set((state: FundsState) => ({
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
        set((state: FundsState) => ({
          groups: state.groups.filter((g: FundGroup) => g.id !== id),
        })),

      addFundToGroup: (fundCode: string, groupId: string) =>
        set((state: FundsState) => ({
          groups: state.groups.map((g: FundGroup) =>
            g.id === groupId && !g.funds.includes(fundCode)
              ? { ...g, funds: [...g.funds, fundCode] }
              : g
          ),
        })),

      removeFundFromGroup: (fundCode: string, groupId: string) =>
        set((state: FundsState) => ({
          groups: state.groups.map((g: FundGroup) =>
            g.id === groupId
              ? { ...g, funds: g.funds.filter((c: string) => c !== fundCode) }
              : g
          ),
        })),
    }),
    {
      name: "fund-tracker-storage",
    }
  )
);
