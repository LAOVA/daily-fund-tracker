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
      if (document.body.contains(script)) document.body.removeChild(script);
      resolve();
    };
    script.onerror = () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      reject(new Error("数据加载失败"));
    };
    document.body.appendChild(script);
  });
};

// 使用JSONP方式获取基金持仓数据（从fundf10接口）
export function fetchFundHoldingsByJsonp(
  code: string
): Promise<{ fundName: string; holdings: Holding[] }> {
  return new Promise((resolve) => {
    // 使用 fundf10 接口获取持仓HTML
    const holdingsUrl = `https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code=${code}&topline=10&rt=${Date.now()}`;
    
    loadScript(holdingsUrl)
      .then(() => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const html = (window as any).apidata?.content || "";
          
          const holdings: Holding[] = [];
          // 解析HTML表格
          const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
          
          for (const r of rows) {
            const cells = (r.match(/<td[\s\S]*?>([\s\S]*?)<\/td>/gi) || []).map(
              (td: string) => td.replace(/<[^>]*>/g, "").trim()
            );
            
            const codeIdx = cells.findIndex((txt: string) => /^\d{6}$/.test(txt));
            const weightIdx = cells.findIndex((txt: string) => /\d+(?:\.\d+)?\s*%/.test(txt));
            
            if (codeIdx >= 0 && weightIdx >= 0) {
              holdings.push({
                code: cells[codeIdx],
                name: cells[codeIdx + 1] || "",
                ratio: parseFloat(cells[weightIdx].replace("%", "")) || 0,
              });
            }
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fundName = (window as any).apidata?.fundname || code;
          
          resolve({ fundName, holdings: holdings.slice(0, 10) });
        } catch (e) {
          console.error("解析持仓数据失败:", e);
          resolve({ fundName: code, holdings: [] });
        }
      })
      .catch(() => {
        resolve({ fundName: code, holdings: [] });
      });
  });
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
