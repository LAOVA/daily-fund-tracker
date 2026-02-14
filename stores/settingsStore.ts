import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  refreshInterval: number; // 刷新间隔（秒）
  autoRefresh: boolean;
  theme: "light"; // 暂时只支持浅色主题
  setRefreshInterval: (interval: number) => void;
  setAutoRefresh: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      refreshInterval: 30, // 默认30秒
      autoRefresh: true,
      theme: "light",

      setRefreshInterval: (interval) =>
        set({
          refreshInterval: Math.max(5, Math.min(300, interval)),
        }),
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
    }),
    {
      name: "fund-tracker-settings",
    }
  )
);
