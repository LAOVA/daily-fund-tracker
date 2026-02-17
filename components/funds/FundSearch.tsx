"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { Search, Loader2, Plus, Folder } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFundsStore, FundGroup } from "@/stores/fundsStore";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface FundSearchRef {
  focus: () => void;
}

interface SearchResult {
  code: string;
  name: string;
  type: string;
}

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
const localSearchData: SearchResult[] = [
  { code: "000001", name: "华夏成长混合", type: "混合型" },
  { code: "000003", name: "中海可转债债券A", type: "债券型" },
  { code: "000011", name: "华夏大盘精选混合", type: "混合型" },
  { code: "000025", name: "招商中证白酒指数", type: "股票型" },
  { code: "000083", name: "汇添富消费行业混合", type: "混合型" },
  { code: "000117", name: "广发轮动配置混合", type: "混合型" },
  { code: "000172", name: "华润元大安鑫灵活配置混合A", type: "混合型" },
  { code: "000198", name: "嘉实活期宝货币", type: "货币型" },
  { code: "000209", name: "信诚新兴产业混合A", type: "混合型" },
  { code: "000248", name: "汇添富中证主要消费ETF联接A", type: "股票型" },
  { code: "000309", name: "汇添富民营活力混合A", type: "混合型" },
  { code: "000362", name: "国泰聚信价值优势灵活配置混合A", type: "混合型" },
  { code: "000408", name: "民生加银城镇化混合", type: "混合型" },
  { code: "000452", name: "南方医药保健灵活配置混合A", type: "混合型" },
  { code: "000478", name: "建信中证500指数增强A", type: "股票型" },
  { code: "000529", name: "广发竞争优势灵活配置混合A", type: "混合型" },
  { code: "000566", name: "华泰柏瑞量化先行混合A", type: "混合型" },
  { code: "000596", name: "前海开源中证军工指数A", type: "股票型" },
  { code: "000614", name: "华安标普全球石油指数", type: "QDII" },
  { code: "000654", name: "华商新锐产业混合", type: "混合型" },
  { code: "000697", name: "汇添富移动互联股票A", type: "股票型" },
  { code: "000742", name: "国泰新经济灵活配置混合", type: "混合型" },
  { code: "000800", name: "华商未来主题混合", type: "混合型" },
  { code: "000831", name: "工银瑞信金融地产行业混合A", type: "混合型" },
  { code: "000862", name: "华宝兴业中证1000指数分级", type: "股票型" },
  { code: "000913", name: "农银汇理医疗保健主题股票", type: "股票型" },
  { code: "000962", name: "天弘中证500指数增强A", type: "股票型" },
  { code: "001027", name: "前海开源中证大农业指数增强", type: "股票型" },
  { code: "001054", name: "东方新能源汽车主题混合", type: "混合型" },
  { code: "001104", name: "华安新丝路主题股票", type: "股票型" },
  { code: "001128", name: "宝盈新兴产业混合A", type: "混合型" },
  { code: "001158", name: "广发制造业精选混合A", type: "混合型" },
  { code: "001179", name: "广发中证养老产业指数A", type: "股票型" },
  { code: "001210", name: "天弘互联网灵活配置混合", type: "混合型" },
  { code: "001268", name: "富国国家安全主题混合", type: "混合型" },
  { code: "001595", name: "天弘中证银行指数A", type: "股票型" },
  { code: "001630", name: "天弘中证计算机主题ETF联接A", type: "股票型" },
  { code: "001632", name: "天弘中证食品饮料指数A", type: "股票型" },
  { code: "001938", name: "中欧时代先锋股票A", type: "股票型" },
  { code: "001975", name: "景顺长城环保优势股票", type: "股票型" },
  { code: "002001", name: "华夏回报混合A", type: "混合型" },
  { code: "002190", name: "农银汇理新能源主题灵活配置混合", type: "混合型" },
  { code: "002236", name: "大成中国互联网主题混合", type: "混合型" },
  { code: "002340", name: "财通可持续发展主题股票", type: "股票型" },
  { code: "002542", name: "长城久鼎灵活配置混合", type: "混合型" },
  { code: "002621", name: "中欧消费主题股票A", type: "股票型" },
  { code: "002656", name: "南方创业板ETF联接A", type: "股票型" },
  { code: "002697", name: "汇添富绝对收益策略定期开放混合发起式", type: "混合型" },
  { code: "002851", name: "保利来纯债债券", type: "债券型" },
  { code: "002963", name: "易方达黄金ETF联接A", type: "商品型" },
  { code: "003096", name: "中欧医疗健康混合A", type: "混合型" },
  { code: "003147", name: "大成互联网思维混合", type: "混合型" },
  { code: "003494", name: "博时军工主题股票A", type: "股票型" },
  { code: "003745", name: "广发多元新兴股票", type: "股票型" },
  { code: "003984", name: "嘉实新能源新材料股票A", type: "股票型" },
  { code: "004070", name: "南方证券ETF联接A", type: "股票型" },
  { code: "004241", name: "中欧时代智慧混合A", type: "混合型" },
  { code: "004746", name: "易方达上证50指数增强A", type: "股票型" },
  { code: "004857", name: "广发中证全指建筑材料指数A", type: "股票型" },
  { code: "005063", name: "华夏短债债券A", type: "债券型" },
  { code: "005176", name: "富国精准医疗灵活配置混合", type: "混合型" },
  { code: "005461", name: "华夏移动互联灵活配置混合", type: "混合型" },
  { code: "005609", name: "广发中证全指家用电器指数A", type: "股票型" },
  { code: "005660", name: "嘉实资源精选股票A", type: "股票型" },
  { code: "005698", name: "华夏全球聚享债券(QDII)", type: "QDII" },
  { code: "005827", name: "易方达蓝筹精选混合", type: "混合型" },
  { code: "005911", name: "广发双擎升级混合A", type: "混合型" },
  { code: "006003", name: "工银瑞信战略转型主题股票A", type: "股票型" },
  { code: "006128", name: "汇添富创新医药主题混合", type: "混合型" },
  { code: "006257", name: "华宝科技先锋混合", type: "混合型" },
  { code: "006408", name: "汇添富消费行业混合", type: "混合型" },
  { code: "006567", name: "华夏行业景气混合", type: "混合型" },
  { code: "007119", name: "睿远成长价值混合A", type: "混合型" },
  { code: "007300", name: "广发稳健增长混合A", type: "混合型" },
  { code: "007412", name: "景顺长城绩优成长混合", type: "混合型" },
  { code: "007531", name: "华安科创主题混合", type: "混合型" },
  { code: "007994", name: "招商国证生物医药指数A", type: "股票型" },
  { code: "008280", name: "广发稳健增长混合C", type: "混合型" },
  { code: "008553", name: "富国中证科技50策略ETF联接A", type: "股票型" },
  { code: "008764", name: "天弘中证光伏产业指数A", type: "股票型" },
  { code: "008888", name: "华夏睿阳一年持有期混合", type: "混合型" },
  { code: "009076", name: "睿远均衡价值三年持有期混合A", type: "混合型" },
  { code: "009265", name: "易方达消费行业股票", type: "股票型" },
  { code: "009314", name: "泰康资产丰瑞混合", type: "混合型" },
  { code: "009608", name: "嘉实中证主要消费ETF联接A", type: "股票型" },
  { code: "009779", name: "招商中证白酒指数(LOF)A", type: "股票型" },
  { code: "010021", name: "华安沪港深优选混合", type: "混合型" },
  { code: "010365", name: "富国中证新能源汽车指数A", type: "股票型" },
  { code: "010662", name: "富国中证军工指数(LOF)A", type: "股票型" },
  { code: "010717", name: "汇添富全球消费行业混合(QDII)人民币A", type: "QDII" },
  { code: "011037", name: "嘉实中证稀土产业ETF联接A", type: "股票型" },
  { code: "011609", name: "天弘中证银行ETF联接A", type: "股票型" },
  { code: "012079", name: "天弘中证光伏产业指数C", type: "股票型" },
  { code: "012414", name: "招商中证白酒指数(LOF)C", type: "股票型" },
  { code: "012585", name: "富国中证芯片产业ETF联接A", type: "股票型" },
  { code: "012698", name: "易方达中证海外中国互联网50ETF联接(QDII)A", type: "QDII" },
  { code: "012751", name: "广发中证基建工程ETF联接A", type: "股票型" },
  { code: "012805", name: "嘉实中证主要消费ETF联接C", type: "股票型" },
  { code: "013081", name: "华夏恒生互联网科技业ETF联接(QDII)A", type: "QDII" },
  { code: "013116", name: "易方达中证人工智能主题ETF联接A", type: "股票型" },
  { code: "013179", name: "易方达中证云计算与大数据主题ETF联接A", type: "股票型" },
  { code: "013196", name: "华夏中证内地低碳经济主题ETF联接A", type: "股票型" },
  { code: "013330", name: "富国中证旅游主题ETF联接A", type: "股票型" },
  { code: "013486", name: "易方达中证稀土产业ETF联接A", type: "股票型" },
  { code: "013817", name: "嘉实中证电池主题ETF联接A", type: "股票型" },
  { code: "014143", name: "招商中证新能源汽车指数A", type: "股票型" },
  { code: "014424", name: "华宝中证医疗ETF联接A", type: "股票型" },
  { code: "014611", name: "嘉实中证高端装备细分50ETF联接A", type: "股票型" },
  { code: "014983", name: "广发中证全指电力公用事业ETF联接A", type: "股票型" },
  { code: "015090", name: "易方达中证红利ETF联接A", type: "股票型" },
  { code: "015311", name: "华夏中证1000ETF联接A", type: "股票型" },
  { code: "015671", name: "嘉实中证信息安全主题ETF联接A", type: "股票型" },
  { code: "015878", name: "易方达中证1000ETF联接A", type: "股票型" },
  { code: "016005", name: "易方达沪深300ETF联接A", type: "股票型" },
  { code: "016090", name: "嘉实中证半导体指数增强A", type: "股票型" },
  { code: "016348", name: "华夏中证500ETF联接A", type: "股票型" },
  { code: "016392", name: "易方达中证光伏产业指数A", type: "股票型" },
  { code: "016858", name: "广发纳斯达克100ETF联接(QDII)A", type: "QDII" },
  { code: "016893", name: "华夏恒生科技ETF联接(QDII)A", type: "QDII" },
  { code: "017090", name: "嘉实中证软件服务指数A", type: "股票型" },
  { code: "017512", name: "富国中证港股通互联网ETF联接A", type: "股票型" },
  { code: "017874", name: "易方达中证军工指数(LOF)A", type: "股票型" },
  { code: "017950", name: "广发中证医疗指数(LOF)A", type: "股票型" },
  { code: "018104", name: "华夏中证动漫游戏ETF联接A", type: "股票型" },
  { code: "018248", name: "嘉实中证稀有金属主题ETF联接A", type: "股票型" },
  { code: "018552", name: "易方达中证科创创业50ETF联接A", type: "股票型" },
  { code: "018700", name: "华夏中证智选300价值稳健策略ETF联接A", type: "股票型" },
  { code: "018834", name: "富国中证红利指数增强A", type: "股票型" },
  { code: "018866", name: "嘉实中证机器人指数A", type: "股票型" },
  { code: "018924", name: "易方达上证科创板50ETF联接A", type: "股票型" },
  { code: "019031", name: "华夏中证100ETF联接A", type: "股票型" },
  { code: "019335", name: "易方达中证稀土产业ETF联接C", type: "股票型" },
  { code: "019564", name: "嘉实中证A50ETF联接A", type: "股票型" },
  { code: "019631", name: "华夏中证A50ETF联接A", type: "股票型" },
  { code: "019922", name: "易方达中证A50ETF联接A", type: "股票型" },
  { code: "110022", name: "易方达消费行业股票", type: "股票型" },
  { code: "110023", name: "易方达医疗保健行业混合", type: "混合型" },
  { code: "110027", name: "易方达安心回报债券A", type: "债券型" },
  { code: "110029", name: "易方达科翔混合", type: "混合型" },
  { code: "110031", name: "易方达恒生中国企业ETF联接(QDII)A", type: "QDII" },
  { code: "160119", name: "南方中证500ETF联接(LOF)A", type: "股票型" },
  { code: "160133", name: "南方天元新产业股票", type: "股票型" },
  { code: "160505", name: "博时主题行业混合(LOF)", type: "混合型" },
  { code: "161005", name: "富国天惠成长混合(LOF)A", type: "混合型" },
  { code: "161606", name: "融通行业景气混合", type: "混合型" },
  { code: "161725", name: "招商中证白酒指数(LOF)A", type: "股票型" },
  { code: "161903", name: "万家行业优选混合(LOF)", type: "混合型" },
  { code: "162006", name: "长城久富混合(LOF)A", type: "混合型" },
  { code: "162201", name: "泰达宏利成长混合", type: "混合型" },
  { code: "162605", name: "景顺长城鼎益混合(LOF)", type: "混合型" },
  { code: "162703", name: "广发小盘成长混合(LOF)A", type: "混合型" },
  { code: "163110", name: "申万菱信量化小盘股票(LOF)A", type: "股票型" },
  { code: "163402", name: "兴全趋势投资混合(LOF)", type: "混合型" },
  { code: "163406", name: "兴全合润混合(LOF)", type: "混合型" },
  { code: "163415", name: "兴全商业模式优选混合(LOF)", type: "混合型" },
  { code: "166002", name: "中欧新蓝筹混合A", type: "混合型" },
  { code: "166006", name: "中欧行业成长混合(LOF)A", type: "混合型" },
  { code: "166009", name: "中欧新动力混合(LOF)A", type: "混合型" },
  { code: "180012", name: "银华富裕主题混合", type: "混合型" },
  { code: "180015", name: "银华增强收益债券", type: "债券型" },
  { code: "200008", name: "长城品牌优选混合", type: "混合型" },
  { code: "210004", name: "金鹰稳健成长混合", type: "混合型" },
  { code: "213006", name: "宝盈核心优势混合A", type: "混合型" },
  { code: "217010", name: "招商大盘蓝筹混合", type: "混合型" },
  { code: "217016", name: "招商安达灵活配置混合", type: "混合型" },
  { code: "217021", name: "招商优势企业混合", type: "混合型" },
  { code: "233009", name: "大摩多因子策略混合", type: "混合型" },
  { code: "240005", name: "华宝多策略增长", type: "混合型" },
  { code: "240006", name: "华宝兴业先进成长混合", type: "混合型" },
  { code: "240008", name: "华宝兴业收益增长混合", type: "混合型" },
  { code: "240009", name: "华宝兴业大盘精选混合", type: "混合型" },
  { code: "257020", name: "国联安精选混合", type: "混合型" },
  { code: "260104", name: "景顺长城内需增长混合", type: "混合型" },
  { code: "260108", name: "景顺长城新兴成长混合", type: "混合型" },
  { code: "260109", name: "景顺长城内需贰号混合", type: "混合型" },
  { code: "270007", name: "广发大盘成长混合", type: "混合型" },
  { code: "270008", name: "广发核心精选混合", type: "混合型" },
  { code: "288001", name: "华夏经典配置混合", type: "混合型" },
  { code: "288002", name: "华夏收入混合", type: "混合型" },
  { code: "320003", name: "诺安先锋混合A", type: "混合型" },
  { code: "320007", name: "诺安成长混合", type: "混合型" },
  { code: "340006", name: "兴全全球视野股票", type: "股票型" },
  { code: "340007", name: "兴全社会责任混合", type: "混合型" },
  { code: "360007", name: "光大保德信量化股票", type: "股票型" },
  { code: "373010", name: "上投摩根双息平衡混合", type: "混合型" },
  { code: "377020", name: "上投摩根内需动力混合", type: "混合型" },
  { code: "377240", name: "上投摩根新兴动力混合A", type: "混合型" },
  { code: "398001", name: "中海优质成长混合", type: "混合型" },
  { code: "398021", name: "中海能源策略混合", type: "混合型" },
  { code: "400003", name: "东方精选混合", type: "混合型" },
  { code: "450003", name: "国富潜力组合混合A", type: "混合型" },
  { code: "450005", name: "国富强化收益债券A", type: "债券型" },
  { code: "450009", name: "国富中小盘股票", type: "股票型" },
  { code: "460005", name: "华泰柏瑞价值增长混合", type: "混合型" },
  { code: "460007", name: "华泰柏瑞行业领先混合", type: "混合型" },
  { code: "460300", name: "华泰柏瑞沪深300ETF联接A", type: "股票型" },
  { code: "470006", name: "汇添富医药保健混合A", type: "混合型" },
  { code: "470007", name: "汇添富上证综合指数", type: "股票型" },
  { code: "481001", name: "工银瑞信核心价值混合", type: "混合型" },
  { code: "481004", name: "工银瑞信稳健成长混合A", type: "混合型" },
  { code: "483003", name: "工银瑞信精选平衡混合", type: "混合型" },
  { code: "485005", name: "工银瑞信增强收益债券A", type: "债券型" },
  { code: "519005", name: "海富通股票混合", type: "混合型" },
  { code: "519007", name: "海富通强化回报混合", type: "混合型" },
  { code: "519011", name: "海富通精选混合", type: "混合型" },
  { code: "519018", name: "汇添富均衡增长混合", type: "混合型" },
  { code: "519021", name: "国泰金鼎价值精选混合", type: "混合型" },
  { code: "519035", name: "富国天博创新主题混合", type: "混合型" },
  { code: "519069", name: "汇添富价值精选混合A", type: "混合型" },
  { code: "519110", name: "浦银安盛价值成长混合A", type: "混合型" },
  { code: "519113", name: "浦银安盛精致生活混合", type: "混合型" },
  { code: "519127", name: "海富通中证100指数(LOF)", type: "股票型" },
  { code: "519181", name: "万家和谐增长混合A", type: "混合型" },
  { code: "519300", name: "大成沪深300指数A", type: "股票型" },
  { code: "530001", name: "建信恒久价值混合", type: "混合型" },
  { code: "540003", name: "汇丰晋信动态策略混合A", type: "混合型" },
  { code: "540006", name: "汇丰晋信大盘股票A", type: "股票型" },
  { code: "560003", name: "益民创新优势混合", type: "混合型" },
  { code: "580001", name: "东吴嘉禾优势精选混合", type: "混合型" },
  { code: "590002", name: "中邮核心成长混合", type: "混合型" },
  { code: "630002", name: "华商盛世成长混合", type: "混合型" },
  { code: "630005", name: "华商动态阿尔法混合", type: "混合型" },
  { code: "630010", name: "华商价值精选混合", type: "混合型" },
  { code: "660001", name: "农银汇理行业成长混合A", type: "混合型" },
  { code: "660005", name: "农银汇理中小盘混合", type: "混合型" },
  { code: "660108", name: "农银汇理沪深300指数", type: "股票型" },
  { code: "660116", name: "农银汇理深证100指数增强", type: "股票型" },
  { code: "673010", name: "西部利得策略优选混合", type: "混合型" },
  { code: "690001", name: "民生加银品牌蓝筹混合", type: "混合型" },
  { code: "700002", name: "平安策略先锋混合", type: "混合型" },
  { code: "750001", name: "安信策略精选灵活配置混合", type: "混合型" },
  { code: "750002", name: "安信目标收益债券A", type: "债券型" },
  { code: "770001", name: "鹏华行业成长证券投资基金", type: "混合型" },
];

export const FundSearch = forwardRef<FundSearchRef>((_, ref) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFund, setSelectedFund] = useState<SearchResult | null>(null);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { watchlist, addFund, groups } = useFundsStore();

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
      setShowResults(true);
    },
  }));

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setSelectedFund(result);
      setShowGroupDialog(true);
    }
    setKeyword("");
    setResults([]);
    setShowResults(false);
  };

  const handleAddToGroup = (groupId: string) => {
    if (selectedFund) {
      addFund({ code: selectedFund.code, name: selectedFund.name }, groupId);
      setShowGroupDialog(false);
      setSelectedFund(null);
    }
  };

  const isInWatchlist = (code: string) => {
    return watchlist.some((f) => f.code === code);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-news-muted" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="输入基金代码或名称搜索..."
          value={keyword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setKeyword(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-4 h-10 bg-white border-news-border focus:border-news-text focus:ring-news-text font-['Source_Sans_3']"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-news-muted animate-spin" />
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-news-border z-50 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-news-muted font-['Source_Sans_3'] text-sm">
              请输入基金代码或名称搜索
            </div>
          ) : (
            results.map((result) => (
              <div
                key={result.code}
                onClick={() => handleSelectFund(result)}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-news-accent border-b border-paper-300 last:border-b-0 transition-colors flex items-center justify-between",
                  isInWatchlist(result.code) && "opacity-50 cursor-not-allowed"
                )}
              >
                <div>
                  <div className="font-['Libre_Baskerville'] font-bold text-news-text">
                    {result.name}
                  </div>
                  <div className="text-xs text-news-muted font-['Source_Sans_3']">
                    {result.code} · {result.type}
                  </div>
                </div>
                {isInWatchlist(result.code) ? (
                  <span className="text-xs text-news-muted font-['Source_Sans_3']">
                    已添加
                  </span>
                ) : (
                  <Plus className="w-4 h-4 text-news-text" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 分组选择对话框 */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent className="sm:max-w-md border-2 border-news-text">
          <DialogHeader>
            <DialogTitle className="font-['Newsreader'] text-2xl font-bold text-news-text">
              选择分组
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-news-muted font-['Source_Sans_3'] mb-4">
              将 <span className="font-bold text-news-text">{selectedFund?.name}</span> 添加到：
            </p>
            {groups.map((group: FundGroup) => (
              <Button
                key={group.id}
                variant="outline"
                className="w-full justify-start border-news-border hover:bg-news-accent hover:border-news-text font-['Source_Sans_3']"
                onClick={() => handleAddToGroup(group.id)}
              >
                <Folder className="w-4 h-4 mr-2 text-news-muted" />
                {group.name}
                <span className="ml-auto text-xs text-news-muted">
                  {group.funds.length}只基金
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

FundSearch.displayName = "FundSearch";
