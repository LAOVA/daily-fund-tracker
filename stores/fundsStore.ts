import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Fund {
  code: string;
  name: string;
  netAssetValue?: number;
  previousNetAssetValue?: number;
  estimatedNetValue?: number;
  estimatedGrowthRate?: number;
  yesterdayChange?: number;
  totalNetValue?: number;
  dailyGrowthRate?: number;
  lastWeekGrowthRate?: number;
  lastMonthGrowthRate?: number;
  thisYearGrowthRate?: number;
  updateTime?: string;
  // 持仓信息
  shares?: number; // 持有份额
  costPrice?: number; // 成本价
  costAmount?: number; // 成本金额
}

export interface FundGroup {
  id: string;
  name: string;
  funds: string[];
}

interface FundsState {
  watchlist: Fund[];
  groups: FundGroup[];
  addFund: (fund: Fund, groupId?: string) => void;
  removeFund: (code: string) => void;
  updateFund: (code: string, data: Partial<Fund>) => void;
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  addFundToGroup: (fundCode: string, groupId: string) => void;
  removeFundFromGroup: (fundCode: string, groupId: string) => void;
  // 持仓管理
  setFundPosition: (code: string, shares: number, costPrice: number) => void;
  removeFundPosition: (code: string) => void;
}

export const useFundsStore = create<FundsState>()(
  persist(
    (set) => ({
      watchlist: [],
      groups: [
        {
          id: "default",
          name: "默认分组",
          funds: [],
        },
      ],

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

      // 设置基金持仓
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

      // 移除基金持仓
      removeFundPosition: (code: string) =>
        set((state) => ({
          watchlist: state.watchlist.map((f) =>
            f.code === code
              ? { ...f, shares: undefined, costPrice: undefined, costAmount: undefined }
              : f
          ),
        })),
    }),
    {
      name: "fund-tracker-storage",
    }
  )
);

