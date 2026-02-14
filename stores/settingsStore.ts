import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  theme: "light"; // 暂时只支持浅色主题
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    () => ({
      theme: "light",
    }),
    {
      name: "fund-tracker-settings",
    }
  )
);
