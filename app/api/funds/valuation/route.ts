import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 基金估值数据接口 - 使用天天基金JSONP接口
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fundCodes = searchParams.get("codes")?.split(",") || [];

  if (fundCodes.length === 0) {
    return NextResponse.json({ error: "请提供基金代码" }, { status: 400 });
  }

  try {
    // 天天基金JSONP接口
    const fundDataPromises = fundCodes.map(async (code) => {
      const url = `http://fundgz.1234567.com.cn/js/${code}.js?v=${Date.now()}`;

      try {
        const response = await fetch(url, {
          headers: {
            Referer: "http://fund.eastmoney.com/",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();

        // 解析JSONP响应
        const jsonMatch = text.match(/jsonpgz\((.+)\)/);
        if (!jsonMatch) {
          return {
            code,
            name: code,
            error: "数据解析失败",
            updateTime: new Date().toISOString(),
          };
        }

        const data = JSON.parse(jsonMatch[1]);

        return {
          code: data.fundcode,
          name: data.name,
          netAssetValue: parseFloat(data.dwjz) || 0, // 单位净值
          totalNetValue: parseFloat(data.dwjz) || 0, // 累计净值
          dailyGrowthRate: parseFloat(data.gszzl) || 0, // 估算涨跌幅
          gsz: parseFloat(data.gsz) || 0, // 估算净值
          gztime: data.gztime, // 估值时间
          updateTime: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`获取基金 ${code} 数据失败:`, error);
        return {
          code,
          name: `${code}`,
          error: "网络错误",
          updateTime: new Date().toISOString(),
        };
      }
    });

    const results = await Promise.all(fundDataPromises);

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "获取基金数据失败", details: String(error) },
      { status: 500 }
    );
  }
}
