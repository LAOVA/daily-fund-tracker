// 基金数据获取工具函数 - 客户端直接调用

export interface FundData {
  code: string;
  name: string;
  netAssetValue?: number;
  totalNetValue?: number;
  dailyGrowthRate?: number;
  lastWeekGrowthRate?: number;
  lastMonthGrowthRate?: number;
  thisYearGrowthRate?: number;
  updateTime?: string;
  error?: string;
}

export interface Holding {
  code: string;
  name: string;
  ratio: number;
  change?: number;
}

// 请求队列，确保 JSONP 回调不会冲突
const requestQueue: Array<() => void> = [];
let isProcessing = false;

const enqueueRequest = (fn: () => void) => {
  requestQueue.push(fn);
  processQueue();
};

const processQueue = () => {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;
  const next = requestQueue.shift();
  if (next) {
    next();
  }
};

const finishRequest = () => {
  isProcessing = false;
  // 使用 setTimeout 确保当前调用栈清空后再处理下一个
  setTimeout(processQueue, 10);
};

// 通用script加载器
const loadScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      setTimeout(() => {
        if (document.body.contains(script)) document.body.removeChild(script);
        resolve();
      }, 200);
    };
    script.onerror = () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      reject(new Error("数据加载失败"));
    };
    document.body.appendChild(script);
  });
};

// 安全的parseFloat，无效时返回undefined而不是0
const safeParseFloat = (value: any): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

// 清理全局变量
const cleanupGlobalData = () => {
  try {
    (window as any).jsonpgz = null;
    (window as any).Data_netWorthTrend = null;
  } catch (e) {
    // 忽略错误
    console.log(e);
  }
};

// 获取完整基金数据（估值 + 历史净值）
export async function fetchFullFundData(code: string): Promise<{
  code: string;
  name: string;
  previousNetAssetValue?: number;
  estimatedNetValue?: number;
  estimatedGrowthRate?: number;
  yesterdayChange?: number;
  lastWeekChange?: number;
  lastMonthChange?: number;
  error?: string;
} | null> {
  return new Promise((resolve) => {
    enqueueRequest(async () => {
      cleanupGlobalData();

      try {
        // 1. 获取实时估值数据
        const gzData: any = await new Promise((resolveInner) => {
          (window as any).jsonpgz = (data: unknown) => resolveInner(data);

          const gzUrl = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;
          loadScript(gzUrl).catch(() => resolveInner(null));

          setTimeout(() => resolveInner(null), 3000);
        });

        // 如果没有获取到估值数据，直接返回null
        if (!gzData || !gzData.gsz || !gzData.dwjz) {
          console.warn(`基金 ${code} 估值数据无效`);
          cleanupGlobalData();
          finishRequest();
          resolve(null);
          return;
        }

        // 2. 获取历史净值走势
        const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
        await loadScript(pingUrl);

        const trend = Array.isArray((window as any).Data_netWorthTrend)
          ? (window as any).Data_netWorthTrend
          : [];

        let yesterdayChange: number | undefined;
        let lastWeekChange: number | undefined;
        let lastMonthChange: number | undefined;
        // let thisYearChange: number | undefined;

        if (trend.length > 0) {
          const sliced = trend.slice(-90);

          // 昨日涨幅
          const last = sliced[sliced.length - 2];
          if (last && typeof last.equityReturn === "number") {
            yesterdayChange = last.equityReturn;
          }

          // 近一周涨幅
          if (sliced.length >= 8) {
            const weekAgo = sliced[sliced.length - 8];
            const current = sliced[sliced.length - 2];
            if (weekAgo && current && weekAgo.y > 0) {
              lastWeekChange = ((current.y - weekAgo.y) / weekAgo.y) * 100;
            }
          }

          // 近一月涨幅
          if (sliced.length >= 32) {
            const monthAgo = sliced[sliced.length - 32];
            const current = sliced[sliced.length - 2];
            if (monthAgo && current && monthAgo.y > 0) {
              lastMonthChange = ((current.y - monthAgo.y) / monthAgo.y) * 100;
            }
          }

          // // 今年来涨幅
          // const currentYear = new Date().getFullYear();
          // const yearStart = sliced.find((item: { x: number }) => {
          //   const date = new Date(item.x);
          //   return (
          //     date.getFullYear() === currentYear &&
          //     date.getMonth() === 0 &&
          //     date.getDate() <= 10
          //   );
          // });
          // const current = sliced[sliced.length - 2];
          // if (yearStart && current && yearStart.y > 0) {
          //   thisYearChange = ((current.y - yearStart.y) / yearStart.y) * 100;
          // }
        }

        const previousNetAssetValue = safeParseFloat(gzData.dwjz);
        const estimatedNetValue = safeParseFloat(gzData.gsz);
        const estimatedGrowthRate = safeParseFloat(gzData.gszzl);

        // 验证核心数据是否有效
        if (
          !previousNetAssetValue ||
          !estimatedNetValue ||
          previousNetAssetValue <= 0 ||
          estimatedNetValue <= 0
        ) {
          console.warn(`基金 ${code} 净值数据无效`);
          cleanupGlobalData();
          finishRequest();
          resolve(null);
          return;
        }

        const result = {
          code: gzData.fundcode || code,
          name: gzData.name || code,
          previousNetAssetValue,
          estimatedNetValue,
          estimatedGrowthRate,
          yesterdayChange,
          lastWeekChange,
          lastMonthChange,
        };

        cleanupGlobalData();
        finishRequest();
        resolve(result);
      } catch (e) {
        console.error("获取基金数据失败", e);
        cleanupGlobalData();
        finishRequest();
        resolve(null);
      }
    });
  });
}

// 批量获取基金数据（串行执行避免回调冲突）
export async function fetchMultipleFundData(
  codes: string[],
  onProgress?: (code: string, data: any) => void
): Promise<Map<string, any>> {
  const results = new Map<string, any>();

  // 串行获取，避免 JSONP 回调冲突
  for (const code of codes) {
    try {
      const data = await fetchFullFundData(code);
      if (data) {
        results.set(code, data);
        onProgress?.(code, data);
      }
    } catch (error) {
      console.error(`获取基金 ${code} 失败:`, error);
    }
  }

  return results;
}

// 根据股票代码推断腾讯接口前缀
const getTencentPrefix = (code: string) => {
  if (code.startsWith("6") || code.startsWith("9")) return "sh";
  if (code.startsWith("0") || code.startsWith("3")) return "sz";
  if (code.startsWith("4") || code.startsWith("8")) return "bj";
  return "sz";
};

// 使用JSONP方式获取基金持仓数据
export async function fetchFundHoldingsByJsonp(code: string): Promise<{
  fundName: string;
  holdings: Holding[];
  yesterdayChange: number | null;
  lastWeekChange: number | null;
  lastMonthChange: number | null;
} | null> {
  try {
    const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&rt=${Date.now()}`;
    await loadScript(holdingsUrl);

    const html = (window as any).apidata?.content || "";
    const holdings: Holding[] = [];
    const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];

    for (const r of rows) {
      const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(
        (td: string) => td.replace(/<[^>]*>/g, "").trim()
      );

      const codeIdx = cells.findIndex((txt: string) => /^\d{6}$/.test(txt));
      const weightIdx = cells.findIndex((txt: string) =>
        /\d+(?:\.\d+)?\s*%/.test(txt)
      );

      if (codeIdx >= 0 && weightIdx >= 0) {
        const ratio = safeParseFloat(cells[weightIdx].replace("%", ""));
        if (ratio !== undefined && ratio > 0) {
          holdings.push({
            code: cells[codeIdx],
            name: cells[codeIdx + 1] || "",
            ratio,
            change: 0,
          });
        }
      }
    }

    // 获取基金名称
    let fundName = code;
    const titleMatch = html.match(/title='([^']+)'/);
    if (titleMatch && titleMatch[1]) {
      fundName = titleMatch[1]
        .trim()
        .replace(/\([^)]*\)[A-Z]?$/, "")
        .trim();
    }

    // 获取历史净值
    let yesterdayChange = null;
    let lastWeekChange = null;
    let lastMonthChange = null;

    try {
      const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
      await loadScript(pingUrl);

      const trend = Array.isArray((window as any).Data_netWorthTrend)
        ? (window as any).Data_netWorthTrend
        : [];

      if (trend.length > 0) {
        const sliced = trend.slice(-90);

        const last = sliced[sliced.length - 2];
        if (last && typeof last.equityReturn === "number") {
          yesterdayChange = last.equityReturn;
        }

        if (sliced.length >= 8) {
          const weekAgo = sliced[sliced.length - 8];
          const current = sliced[sliced.length - 2];
          if (weekAgo && current && weekAgo.y > 0) {
            lastWeekChange = ((current.y - weekAgo.y) / weekAgo.y) * 100;
          }
        }

        if (sliced.length >= 32) {
          const monthAgo = sliced[sliced.length - 32];
          const current = sliced[sliced.length - 2];
          if (monthAgo && current && monthAgo.y > 0) {
            lastMonthChange = ((current.y - monthAgo.y) / monthAgo.y) * 100;
          }
        }
      }
    } catch (e) {
      console.error("获取历史净值失败:", e);
    }

    // 补充重仓股涨跌幅
    if (holdings.length > 0) {
      try {
        const tencentCodes = holdings
          .map((h) => `s_${getTencentPrefix(h.code)}${h.code}`)
          .join(",");
        const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;
        await loadScript(quoteUrl);

        holdings.forEach((h) => {
          const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;
          const dataStr = (window as any)[varName];
          if (dataStr) {
            const parts = dataStr.split("~");
            if (parts.length > 5 && parts[5]) {
              const changeValue = safeParseFloat(parts[5]);
              h.change = changeValue ?? 0;
            }
          }
        });
      } catch (e) {
        console.error("获取股票行情失败:", e);
      }
    }

    return {
      fundName,
      holdings: holdings.slice(0, 10),
      yesterdayChange,
      lastWeekChange,
      lastMonthChange,
    };
  } catch (e) {
    console.error("解析持仓数据失败:", e);
    return null;
  }
}

// 搜索基金
export async function searchFundsDirect(
  keyword: string
): Promise<Array<{ code: string; name: string; type: string }>> {
  try {
    const searchUrl = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(
      keyword
    )}&_=${Date.now()}`;

    const response = await fetch(searchUrl, {
      mode: "cors",
      headers: { Referer: "https://fund.eastmoney.com/" },
    });

    if (!response.ok) throw new Error("Search failed");

    const data = await response.json();
    interface SearchItem {
      CODE?: string;
      NAME?: string;
      CATEGORYDESC?: string;
    }
    return (
      data?.Datas?.map((item: SearchItem) => ({
        code: item.CODE || "",
        name: item.NAME || "",
        type: item.CATEGORYDESC || "基金",
      })) || []
    );
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

