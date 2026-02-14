"use client";

import { FundSearch } from "@/components/funds/FundSearch";
import { ValuationTable } from "@/components/funds/ValuationTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettingsStore } from "@/stores/settingsStore";

// 快讯数据（可后续接入真实API）
const newsItems: {
  time: string;
  tag: string;
  text: string;
  type: "rise" | "fall" | "neutral" | "warning";
}[] = [];

// 板块行情数据（可后续接入真实API）
const sectorData: { name: string; change: number }[] = [];

export default function Home() {
  const { autoRefresh, refreshInterval, setAutoRefresh, setRefreshInterval } =
    useSettingsStore();

  return (
    <div className="space-y-6">
      {/* 重要新闻头条 */}
      <section className="mb-8">
        <div className="bg-white news-border p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="kicker text-[#8B0000] bg-[#F5F0E6] px-3 py-1">
              市场要闻
            </span>
            <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
              {new Date().toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
          </div>
          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-[#2D2A26] mb-4 leading-tight headline-underline">
            暂无新闻数据
          </h2>
          <p className="font-['Libre_Baskerville'] text-lg text-[#2D2A26] leading-relaxed">
            请搜索并添加基金以查看实时估值数据
          </p>
        </div>
      </section>

      {/* 主体网格布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：基金估值 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 搜索和估值表格 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FundSearch />
            </div>
            <ValuationTable />
          </div>
        </div>

        {/* 右侧：快讯和设置 */}
        <div className="space-y-6">
          {/* 设置面板 */}
          <Card className="border-3 border-[#C9C2B5]">
            <CardHeader className="border-b-2 border-[#C9C2B5] px-5 py-4">
              <CardTitle className="font-['Playfair_Display'] text-lg font-bold text-[#2D2A26]">
                刷新设置
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2D2A26] font-['Source_Sans_3']">
                  自动刷新
                </span>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#2D2A26] font-['Source_Sans_3']">
                    刷新间隔
                  </span>
                  <span className="text-sm text-[#6B6560] font-mono">
                    {refreshInterval}秒
                  </span>
                </div>
                <Slider
                  value={[refreshInterval]}
                  onValueChange={(value) => setRefreshInterval(value[0])}
                  min={5}
                  max={300}
                  step={5}
                  disabled={!autoRefresh}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-[#6B6560]">
                  <span>5秒</span>
                  <span>300秒</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 市场快讯 */}
          <Card className="border-3 border-[#C9C2B5]">
            <CardHeader className="border-b-2 border-[#C9C2B5] px-5 py-4 flex flex-row items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-[#E65100]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <CardTitle className="font-['Playfair_Display'] text-lg font-bold text-[#2D2A26]">
                市场快讯
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {newsItems.map((item, index) => (
                <div
                  key={index}
                  className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 transition-colors border-l-2 border-transparent hover:border-[#C41E3A]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                      {item.time}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs font-['Source_Sans_3'] ${
                        item.type === "rise"
                          ? "bg-[#C41E3A] text-white"
                          : item.type === "fall"
                          ? "bg-[#228B22] text-white"
                          : item.type === "warning"
                          ? "bg-[#E65100] text-white"
                          : "bg-[#1565C0] text-white"
                      }`}
                    >
                      {item.tag}
                    </Badge>
                  </div>
                  <p className="font-['Libre_Baskerville'] text-sm text-[#2D2A26] leading-snug">
                    {item.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 板块行情 */}
          <Card className="border-3 border-[#C9C2B5]">
            <CardHeader className="border-b-2 border-[#C9C2B5] px-5 py-4">
              <CardTitle className="font-['Playfair_Display'] text-lg font-bold text-[#2D2A26]">
                板块行情
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-0">
              {sectorData.map((sector, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <span className="font-['Libre_Baskerville'] text-sm text-[#2D2A26]">
                    {sector.name}
                  </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      sector.change > 0
                        ? "text-[#C41E3A]"
                        : sector.change < 0
                        ? "text-[#228B22]"
                        : "text-[#1565C0]"
                    }`}
                  >
                    {sector.change > 0 ? "+" : ""}
                    {sector.change.toFixed(2)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

