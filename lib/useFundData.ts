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
}

// 通用script加载器
const loadScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      // JSONP回调需要时间执行，延迟一下
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

// 获取完整基金数据（估值 + 历史净值）
export async function fetchFullFundData(code: string): Promise<{
  code: string;
  name: string;
  previousNetAssetValue?: number; // 昨日净值
  estimatedNetValue?: number; // 估值净值
  estimatedGrowthRate?: number; // 估值涨跌幅
  yesterdayChange?: number; // 昨日涨幅
  lastWeekChange?: number; // 近一周涨幅
  lastMonthChange?: number; // 近一月涨幅
  thisYearChange?: number; // 今年来涨幅
}> {
  // 先清理可能残留的数据（不能用delete，设置null）
  try {
    (window as any).jsonpgz = null;

    (window as any).Data_netWorthTrend = null;
  } catch (e) {
    // 忽略错误
  }

  try {
    // 1. 获取实时估值数据 - 使用Promise包装JSONP回调
    console.log("开始获取估值数据:", code);

    const gzData: any = await new Promise((resolve) => {
      (window as any).jsonpgz = (data: unknown) => {
        console.log("jsonpgz回调data:", data);
        resolve(data);
      };

      const gzUrl = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`;
      loadScript(gzUrl).catch(() => resolve(undefined));

      // 超时处理
      setTimeout(() => resolve(undefined), 3000);
    });

    console.log("估值数据:", code, gzData);

    // 2. 获取历史净值走势
    console.log("开始获取历史净值:", code);
    const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
    await loadScript(pingUrl);

    const trend = Array.isArray((window as any).Data_netWorthTrend)
      ? (window as any).Data_netWorthTrend
      : [];

    console.log(
      "历史净值数据:",
      code,
      "条数:",
      trend.length,
      "最新净值:",
      trend[trend.length - 1]?.y
    );

    let yesterdayChange: number | undefined;
    let lastWeekChange: number | undefined;
    let lastMonthChange: number | undefined;
    let thisYearChange: number | undefined;

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

      // 今年来涨幅 - 找到今年第一天
      const currentYear = new Date().getFullYear();
      const yearStart = sliced.find((item: { x: number }) => {
        const date = new Date(item.x);
        return (
          date.getFullYear() === currentYear &&
          date.getMonth() === 0 &&
          date.getDate() <= 10
        );
      });
      const current = sliced[sliced.length - 2];
      if (yearStart && current && yearStart.y > 0) {
        thisYearChange = ((current.y - yearStart.y) / yearStart.y) * 100;
      }
    }

    return {
      code: gzData?.fundcode || code,
      name: gzData?.name || code,
      previousNetAssetValue: parseFloat(gzData?.dwjz) || 0,
      estimatedNetValue: parseFloat(gzData?.gsz) || 0,
      estimatedGrowthRate: parseFloat(gzData?.gszzl) || 0,
      yesterdayChange,
      lastWeekChange,
      lastMonthChange,
      thisYearChange,
    };
  } catch (e) {
    console.error("获取基金数据失败", e);
    return { code, name: code };
  }
}

// 根据股票代码推断腾讯接口前缀
const getTencentPrefix = (code: string) => {
  if (code.startsWith("6") || code.startsWith("9")) return "sh";
  if (code.startsWith("0") || code.startsWith("3")) return "sz";
  if (code.startsWith("4") || code.startsWith("8")) return "bj";
  return "sz";
};

export interface Holding {
  code: string;
  name: string;
  ratio: number;
  change?: number; // 股票涨跌幅
}

// 使用JSONP方式获取基金持仓数据（从fundf10接口）
export async function fetchFundHoldingsByJsonp(code: string): Promise<{
  fundName: string;
  holdings: Holding[];
  yesterdayChange: number | null;
  lastWeekChange: number | null;
  lastMonthChange: number | null;
}> {
  // 使用 fundf10 接口获取持仓HTML
  const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&rt=${Date.now()}`;

  await loadScript(holdingsUrl);

  try {
    const html = (window as any).apidata?.content || "";

    const holdings: Holding[] = [];
    // 解析HTML表格
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
        holdings.push({
          code: cells[codeIdx],
          name: cells[codeIdx + 1] || "",
          ratio: parseFloat(cells[weightIdx].replace("%", "")) || 0,
          change: 0, // 初始化为0，后续通过腾讯接口获取
        });
      }
    }

    // 获取基金名称 - 从HTML内容中提取

    const apidata = (window as any).apidata;
    const htmlContent = apidata?.content || "";

    // 尝试多种方式提取基金名称
    let fundName = code;

    // 方式1: 从 <a title='基金名称'> 中提取
    const titleMatch = htmlContent.match(/title='([^']+)'/);
    if (titleMatch && titleMatch[1]) {
      fundName = titleMatch[1].trim();
      // 去掉可能的括号内容如 (LOF)A
      fundName = fundName.replace(/\([^)]*\)[A-Z]?$/, "").trim();
    }

    // 获取历史净值走势（pingzhongdata接口）
    // 用于计算昨日涨幅、近一周、近一月等
    let historyTrend: { x: number; y: number; equityReturn: number }[] = [];
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
        // 保留最近90个点
        const sliced = trend.slice(-90);
        historyTrend = sliced.map(
          (item: { x: number; y: number; equityReturn: number }) => ({
            x: item.x,
            y: item.y,
            equityReturn: item.equityReturn,
          })
        );

        // 昨日涨幅 (equityReturn)
        const last = sliced[sliced.length - 2];
        if (last && typeof last.equityReturn === "number") {
          yesterdayChange = last.equityReturn;
        }

        // 近一周涨幅 - 需要计算7天前的净值变化
        if (sliced.length >= 8) {
          const weekAgo = sliced[sliced.length - 8];
          const current = sliced[sliced.length - 2];
          if (weekAgo && current && weekAgo.y > 0) {
            lastWeekChange = ((current.y - weekAgo.y) / weekAgo.y) * 100;
          }
        }

        // 近一月涨幅 - 需要计算30天前的净值变化
        if (sliced.length >= 32) {
          const monthAgo = sliced[sliced.length - 32];
          const current = sliced[sliced.length - 2];
          if (monthAgo && current && monthAgo.y > 0) {
            lastMonthChange = ((current.y - monthAgo.y) / monthAgo.y) * 100;
          }
        }
      }
    } catch (e) {
      console.error("获取历史净值走势失败", e);
    }

    const resultHoldings = holdings.slice(0, 10);

    // 补充每只重仓股当日涨跌幅（腾讯行情）
    if (resultHoldings.length > 0) {
      const tencentCodes = resultHoldings
        .map((h) => `s_${getTencentPrefix(h.code)}${h.code}`)
        .join(",");
      const quoteUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;

      await loadScript(quoteUrl);
      resultHoldings.forEach((h) => {
        const varName = `v_s_${getTencentPrefix(h.code)}${h.code}`;

        const dataStr = (window as any)[varName];
        if (dataStr) {
          const parts = dataStr.split("~");
          // parts[5] 是涨跌幅
          if (parts.length > 5) {
            h.change = parseFloat(parts[5]);
          }
        }
      });
    }

    return {
      fundName,
      holdings: resultHoldings,
      yesterdayChange,
      lastWeekChange,
      lastMonthChange,
    };
  } catch (e) {
    console.error("解析持仓数据失败:", e);
    return {
      fundName: code,
      holdings: [],
      yesterdayChange: null,
      lastWeekChange: null,
      lastMonthChange: null,
    };
  }
}

// 直接从天天基金获取数据（客户端）
export async function fetchFundValuationDirect(
  code: string
): Promise<FundData> {
  try {
    const response = await fetch(
      `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`,
      {
        headers: { Referer: "https://fund.eastmoney.com/" },
        mode: "cors",
      }
    );

    if (!response.ok) throw new Error("Network error");

    const text = await response.text();
    const extractValue = (pattern: RegExp) => {
      const match = text.match(pattern);
      return match ? match[1] : null;
    };

    const fundName = extractValue(/"fundName":"([^"]+)"/) || code;
    const nav = extractValue(/"netAssetValue":([\d.]+)/);

    if (!nav) throw new Error("No data");

    return {
      code,
      name: fundName,
      netAssetValue: parseFloat(nav),
      totalNetValue:
        parseFloat(
          extractValue(/(?:totalNetValue|accumulatedNetValue):([\d.]+)/) || nav
        ) || 0,
      dailyGrowthRate: parseFloat(
        extractValue(/"dailyGrowthRate":(-?[\d.]+)/) || "0"
      ),
      lastWeekGrowthRate: parseFloat(
        extractValue(/"lastWeekGrowthRate":(-?[\d.]+)/) || "0"
      ),
      lastMonthGrowthRate: parseFloat(
        extractValue(/"lastMonthGrowthRate":(-?[\d.]+)/) || "0"
      ),
      thisYearGrowthRate: parseFloat(
        extractValue(/"thisYearGrowthRate":(-?[\d.]+)/) || "0"
      ),
      updateTime: new Date().toISOString(),
    };
  } catch (error) {
    return {
      code,
      name: code,
      error: "数据获取失败",
      updateTime: new Date().toISOString(),
    };
  }
}

// 获取多个基金数据
export async function fetchMultipleFunds(codes: string[]): Promise<FundData[]> {
  const promises = codes.map((code) => fetchFundValuationDirect(code));
  return Promise.all(promises);
}

// 从天天基金获取持仓数据
export async function fetchFundHoldingsDirect(
  code: string
): Promise<{ fundName: string; holdings: Holding[] }> {
  try {
    const response = await fetch(
      `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`,
      {
        headers: { Referer: "https://fund.eastmoney.com/" },
        mode: "cors",
      }
    );

    if (!response.ok) throw new Error("Network error");

    const text = await response.text();
    const fundName = text.match(/"fundName":"([^"]+)"/)?.[1] || code;

    const holdingsMatch = text.match(/stockCodes\s*=\s*\[([^\]]+)\]/);
    const stockNamesMatch = text.match(/stockNames\s*=\s*(\[[^\]]+\])/);
    const holdRatiosMatch = text.match(/holdRatios\s*=\s*(\[[^\]]+\])/);

    if (!holdingsMatch || !stockNamesMatch || !holdRatiosMatch) {
      return { fundName, holdings: [] };
    }

    const stockCodes = JSON.parse("[" + holdingsMatch[1] + "]");
    const stockNames = JSON.parse(stockNamesMatch[1]);
    const holdRatios = JSON.parse(holdRatiosMatch[1]);

    const holdings: Holding[] = [];
    const count = Math.min(
      10,
      stockCodes.length,
      stockNames.length,
      holdRatios.length
    );

    for (let i = 0; i < count; i++) {
      if (stockCodes[i] && stockNames[i]) {
        holdings.push({
          code: stockCodes[i],
          name: stockNames[i],
          ratio: parseFloat(holdRatios[i]) || 0,
        });
      }
    }

    return { fundName, holdings };
  } catch (error) {
    return { fundName: code, holdings: [] };
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

// 使用JSONP方式获取基金持仓数据（客户端）
export function fetchFundHoldingsJsonp(
  code: string
): Promise<{ fundName: string; holdings: Holding[] }> {
  return new Promise((resolve) => {
    const url = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&rt=${Date.now()}`;

    const script = document.createElement("script");
    script.src = url;

    // 设置超时
    const timeout = setTimeout(() => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      resolve({ fundName: code, holdings: [] });
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }

      try {
        const content = (window as any).apidata?.content || "";
        const fundNameMatch = content.match(/^(.+?)\s+/);
        const fundName = fundNameMatch ? fundNameMatch[1].trim() : code;

        const holdings: Holding[] = [];
        const lines = content.split("\n");
        let foundTable = false;

        for (const line of lines) {
          if (line.includes("股票代码") && line.includes("占净值比例")) {
            foundTable = true;
            continue;
          }

          if (foundTable && line.includes("|") && line.includes("%")) {
            const cells = line.split("|").filter((c: string) => c.trim());
            if (cells.length >= 7) {
              const codeMatch = cells[1].match(/\d{6}/);
              const name = cells[2].trim();
              const ratioMatch = cells[cells.length - 1].match(/(\d+\.?\d*)%/);

              if (codeMatch && name && ratioMatch) {
                holdings.push({
                  code: codeMatch[0],
                  name: name,
                  ratio: parseFloat(ratioMatch[1]),
                });
              }
            }
          }

          if (foundTable && (line.trim() === "" || line.startsWith("####"))) {
            break;
          }
        }

        resolve({ fundName, holdings: holdings.slice(0, 10) });
      } catch (e) {
        console.error("解析持仓数据失败:", e);
        resolve({ fundName: code, holdings: [] });
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      resolve({ fundName: code, holdings: [] });
    };

    document.body.appendChild(script);
  });
}
