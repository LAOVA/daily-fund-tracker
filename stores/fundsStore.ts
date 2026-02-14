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
    (set, get) => ({
      watchlist: [],
      groups: [
        {
          id: "default",
          name: "默认分组",
          funds: [],
        },
      ],

      addFund: (fund) =>
        set((state) => {
          const exists = state.watchlist.some((f) => f.code === fund.code);
          if (exists) return state;

          const newWatchlist = [...state.watchlist, fund];
          const defaultGroup = state.groups.find((g) => g.id === "default");

          if (defaultGroup) {
            return {
              watchlist: newWatchlist,
              groups: state.groups.map((g) =>
                g.id === "default"
                  ? { ...g, funds: [...g.funds, fund.code] }
                  : g
              ),
            };
          }

          return { watchlist: newWatchlist };
        }),

      removeFund: (code) =>
        set((state) => ({
          watchlist: state.watchlist.filter((f) => f.code !== code),
          groups: state.groups.map((g) => ({
            ...g,
            funds: g.funds.filter((c) => c !== code),
          })),
        })),

      updateFund: (code, data) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code ? { ...f, ...data } : f
          ),
        })),

      addGroup: (name) =>
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

      removeGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addFundToGroup: (fundCode, groupId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId && !g.funds.includes(fundCode)
              ? { ...g, funds: [...g.funds, fundCode] }
              : g
          ),
        })),

      removeFundFromGroup: (fundCode, groupId) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId
              ? { ...g, funds: g.funds.filter((c) => c !== fundCode) }
              : g
          ),
        })),
    }),
    {
      name: "fund-tracker-storage",
    }
  )
);
