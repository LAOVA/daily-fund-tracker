import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 基金搜索接口 - 使用东方财富搜索API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";

  if (!keyword || keyword.length < 1) {
    return NextResponse.json(
      { error: "请输入关键词进行搜索" },
      { status: 400 }
    );
  }

  try {
    // 东方财富基金搜索API
    const searchUrl = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(
      keyword
    )}&_=${Date.now()}`;

    const response = await fetch(searchUrl, {
      headers: {
        Referer: "https://fund.eastmoney.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`搜索API请求失败: ${response.status}`);
    }

    const data = await response.json();

    // 解析东方财富搜索结果
    interface SuggestItem {
      CODE?: string;
      NAME?: string;
      TYPE?: string;
      MGR?: string;
      CATEGORY?: number | string;
      CATEGORYDESC?: string;
    }

    const results =
      (data?.Datas as SuggestItem[] | undefined)?.map((item) => ({
        code: item?.CODE || "",
        name: item?.NAME || "",
        type: item?.CATEGORYDESC || "基金",
      })) || [];

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Search API Error:", error);

    // 如果API失败，返回空结果
    return NextResponse.json({
      success: true,
      data: [],
      error: "搜索服务暂时不可用",
      timestamp: new Date().toISOString(),
    });
  }
}
