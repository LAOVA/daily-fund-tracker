"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFundsStore } from "@/stores/fundsStore";
import { cn } from "@/lib/utils";

interface SearchResult {
  code: string;
  name: string;
  type: string;
}

// 加载外部脚本
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

// 使用JSONP进行基金搜索（客户端方式）
const searchFundsJsonp = async (keyword: string): Promise<SearchResult[]> => {
  const val = String(keyword || "").trim();
  if (!val) return [];

  const callbackName = `SuggestData_${Date.now()}`;

  return new Promise((resolve) => {
    const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(
      val
    )}&callback=${callbackName}&_=${Date.now()}`;

    (window as any)[callbackName] = (data: any) => {
      let result: SearchResult[] = [];
      if (data && data.Datas) {
        result = data.Datas.filter(
          (d: any) =>
            d.CATEGORY === 700 ||
            d.CATEGORY === "700" ||
            d.CATEGORYDESC === "基金"
        ).map((item: any) => ({
          code: item.CODE || "",
          name: item.NAME || "",
          type: item.CATEGORYDESC || "基金",
        }));
      }
      delete (window as any)[callbackName];
      resolve(result);
    };

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.onload = () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
    script.onerror = () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      delete (window as any)[callbackName];
      resolve([]);
    };
    document.body.appendChild(script);
  });
};

// 本地搜索数据作为fallback（当API不可用时使用）
const localSearchData: SearchResult[] = [];

export function FundSearch() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { watchlist, addFund } = useFundsStore();

  const searchFunds = useCallback(async (query: string) => {
    if (query.length < 1) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // 使用客户端JSONP搜索（更稳定）
      const jsonpResults = await searchFundsJsonp(query);

      if (jsonpResults && jsonpResults.length > 0) {
        setResults(jsonpResults);
      } else {
        // 本地搜索 fallback
        const localResults = localSearchData.filter(
          (item) =>
            item.code.toLowerCase().includes(query.toLowerCase()) ||
            item.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(localResults);
      }
    } catch (error) {
      console.error("Search error:", error);
      // 本地搜索 fallback
      const localResults = localSearchData.filter(
        (item) =>
          item.code.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(localResults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword) {
        searchFunds(keyword);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, searchFunds]);

  const handleSelectFund = (result: SearchResult) => {
    const exists = watchlist.some((f) => f.code === result.code);
    if (!exists) {
      addFund({ code: result.code, name: result.name });
    }
    setKeyword("");
    setResults([]);
    setShowResults(false);
  };

  const isInWatchlist = (code: string) => {
    return watchlist.some((f) => f.code === code);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6560]" />
        <Input
          type="text"
          placeholder="输入基金代码或名称搜索..."
          value={keyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKeyword(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-4 h-10 bg-white border-[#C9C2B5] focus:border-[#2D2A26] focus:ring-[#2D2A26] font-['Source_Sans_3']"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6560] animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#C9C2B5] z-50 max-h-64 overflow-y-auto">
          {results.map((result) => (
            <div
              key={result.code}
              onClick={() => handleSelectFund(result)}
              className={cn(
                "px-4 py-3 cursor-pointer hover:bg-[#F5F0E6] border-b border-[#E5E5E5] last:border-b-0 transition-colors flex items-center justify-between",
                isInWatchlist(result.code) && "opacity-50 cursor-not-allowed"
              )}
            >
              <div>
                <div className="font-['Libre_Baskerville'] font-bold text-[#2D2A26]">
                  {result.name}
                </div>
                <div className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                  {result.code} · {result.type}
                </div>
              </div>
              {isInWatchlist(result.code) ? (
                <span className="text-xs text-[#6B6560] font-['Source_Sans_3']">
                  已添加
                </span>
              ) : (
                <Plus className="w-4 h-4 text-[#2D2A26]" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
