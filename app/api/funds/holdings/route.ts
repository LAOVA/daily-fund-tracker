import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 基金持仓数据接口
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fundCode = searchParams.get("code");

  if (!fundCode) {
    return NextResponse.json({ error: "请提供基金代码" }, { status: 400 });
  }

  try {
    // 获取基金名称
    let fundName = fundCode;
    try {
      const gzUrl = `https://fundgz.1234567.com.cn/js/${fundCode}.js?v=${Date.now()}`;
      const gzRes = await fetch(gzUrl, {
        headers: { Referer: "https://fund.eastmoney.com/" },
      });
      const gzText = await gzRes.text();
      const jsonMatch = gzText.match(/jsonpgz\((.+)\)/);
      if (jsonMatch) {
        const gzData = JSON.parse(jsonMatch[1]);
        fundName = gzData.name || fundName;
      }
    } catch (e) {
      console.error("获取基金名称失败:", e);
    }

    // 获取持仓数据 - 使用 pingzhongdata 接口
    const pingUrl = `https://fund.eastmoney.com/pingzhongdata/${fundCode}.js?v=${Date.now()}`;

    const holdings: Array<{ code: string; name: string; ratio: number }> = [];

    try {
      const pingRes = await fetch(pingUrl, {
        headers: {
          Referer: "https://fund.eastmoney.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const text = await pingRes.text();

      // 解析 stockCodes, stockNames, holdRatios
      const stockCodesMatch = text.match(/stockCodes\s*=\s*(\[[^\]]+\])/);
      const stockNamesMatch = text.match(/stockNames\s*=\s*(\[[^\]]+\])/);
      const holdRatiosMatch = text.match(/holdRatios\s*=\s*(\[[^\]]+\])/);

      if (stockCodesMatch && stockNamesMatch && holdRatiosMatch) {
        const stockCodes = JSON.parse(stockCodesMatch[1]);
        const stockNames = JSON.parse(stockNamesMatch[1]);
        const holdRatios = JSON.parse(holdRatiosMatch[1]);

        const count = Math.min(
          10,
          stockCodes.length,
          stockNames.length,
          holdRatios.length
        );

        for (let i = 0; i < count; i++) {
          if (stockCodes[i] && stockNames[i]) {
            holdings.push({
              code: String(stockCodes[i]),
              name: String(stockNames[i]),
              ratio: parseFloat(holdRatios[i]) || 0,
            });
          }
        }
      }
    } catch (e) {
      console.error("获取持仓数据失败:", e);
    }

    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          fundCode,
          fundName,
          holdings: [],
          note: "暂无持仓数据",
          updateTime: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        fundCode,
        fundName,
        holdings,
        updateTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "获取持仓数据失败", details: String(error) },
      { status: 500 }
    );
  }
}
