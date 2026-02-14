1. 基金估值（天天基金）
这是目前最常用的基金实时估值接口，数据更新频率很高。[1][2][3]
接口地址：
code
Http
http://fundgz.1234567.com.cn/js/{基金代码}.js
(注：1234567.com.cn 是天天基金的官方域名)[1][3][4]
示例： 获取“招商中证白酒”（161725）的估值[1][3][4][5]
URL: http://fundgz.1234567.com.cn/js/161725.js[1][3]
返回格式： JSONP
code
JavaScript
jsonpgz({"fundcode":"161725","name":"招商中证白酒指数(LOF)A","jzrq":"2023-10-27","dwjz":"0.8920","gsz":"0.8950","gszzl":"0.34","gztime":"2023-10-30 15:00"});
```[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[2](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHhENiP_3c714MBd6Ypo_xlCGKIZ5RQFSb11dzewUSEQNUoB846MW8vjswmp1ZbLAhGeHY8lOvEsC-kkk-ShuPi3Czckx99Hw1A9dasxkXM69xhAh7QdSiQxEL33UmtJbxglwyRWvJaQNZtv8lNNKJpXXLrbTGALSM%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
*   `gsz`: 估算净值
*   `gszzl`: 估算涨跌幅（%）
*   `gztime`: 估值时间
2. 股票行情（腾讯财经）
腾讯的接口支持多只股票批量查询，速度极快，涵盖A股、港股、美股。[1][2][3]
接口地址：
code
Http
http://qt.gtimg.cn/q={市场代码}{股票代码}
```[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
示例：
A股（上证）： http://qt.gtimg.cn/q=sh600519 (茅台)[1][3]
A股（深证）： http://qt.gtimg.cn/q=sz000858 (五粮液)[1][3]
港股： http://qt.gtimg.cn/q=hk00700 (腾讯)[1][3]
批量查询： http://qt.gtimg.cn/q=sh600519,sz000858[1][3]
返回格式： 字符串（以 ~ 分隔）
code
Text
v_sh600519="1~贵州茅台~600519~1650.00~1640.00~1645.00~...";
```[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
*   第3位：当前价格[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
*   第4位：昨日收盘价[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
*   第32位：涨跌幅(%)[[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)]
3. 基金重仓数据（东方财富）
东方财富没有直接返回“纯重仓股列表”的简单JSON接口，数据通常包含在基金详情的大型JS文件中。[1][2][3]
接口地址：
code
Http
http://fund.eastmoney.com/pingzhongdata/{基金代码}.js
```[[1](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQH_36vt1jZ-EwDhkQdhpkKAEwGbjfTJlY_1qWRyA-niV0yymH5MQp3vv8HtTovZlir_FbdzUp7sBb8R4lF722Xnc4fORBsrHSvkgW6_wn8e437Jo2Xzbuky7tBeay_05WNlN7Zm587EEQdbB7PE1qlSf0E%3D)][[3](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQHyE5Zd4MA8FLauXzmLl-wyB2yESewBVVkoxlnOlu0UQO42HVEqKgL9_P-cFIIkGwRF3UNni9a1gRj0oHUZdxKMHG6yBxL0T7HdnvIRVeLNb7boyZ9LiW9dd8owSYZLvmN_ZAFo)][[6](https://www.google.com/url?sa=E&q=https%3A%2F%2Fvertexaisearch.cloud.google.com%2Fgrounding-api-redirect%2FAUZIYQFJV-tn86XohbNRhJWYNVwRCrkdUXUcEcU1e1-ueIQtsRwgO9Rptr3uYW3FR0A-H4xvq4_1-q7PbAJ97Tj_9eX8tYjckPsTsynPM7OeGfo9U4XG-jWCxEjdvKn25Yx_Z1gglchgrui4MQxqkdLmiBNR)]
示例： http://fund.eastmoney.com/pingzhongdata/161725.js[1][3]
如何获取重仓股：
请求该URL后，返回的内容是多个JavaScript变量定义。你需要解析（或正则匹配）其中的 stockCodes（股票代码数组）和 stockCodesNew（最新一期重仓股代码）变量。[1]
数据通常包含：股票代码、股票名称、占净值比例等。[1][3][7]
注意：该文件较大，包含了基金的历史净值、累计收益等所有详情数据。[1][2][8]
📚 是否有文档网站？
官方没有文档网站。这些都是“隐藏”的Web接口。[1][3]
但你可以参考以下开源项目，它们封装了上述接口并提供了文档：
AkShare (推荐)
介绍： 目前最全的Python开源金融数据库，接入了东方财富、新浪、腾讯等数据。[1][2][3]
文档地址： akshare.akfamily.xyz
对应功能：
基金估值：fund_value_estimation_em
基金重仓：fund_portfolio_hold_em[1][3][8]
股票行情：stock_zh_a_spot_em[1][3][9]
Tushare
介绍： 老牌金融数据接口，专业性强，但Pro版部分数据需要积分（付费）。[1][2]
文档地址： tushare.pro
🛠️ 其他公开服务接口推荐
如果你需要更稳定、格式更规范的开发接口，可以考虑以下：
服务名称	接口特点	费用	适用场景
Sina Finance (新浪)	http://hq.sinajs.cn/list=...[1][2]	免费	老牌接口，格式类似腾讯，简单稳定
BaoStock	Python库，提供历史数据下载	免费	历史K线回测，不适合实时
EFinance	专门针对东方财富接口封装的Python库	免费	专门爬取东财数据，适合个人研究
Yahoo Finance (yfinance)	国际接口，含美股/A股	免费	全球市场数据，但国内访问速度稍慢
建议： 如果你是做个人开发或量化分析，直接使用 AkShare 库是最高效的选择，它帮你屏蔽了底层接口变动（如东方财富网页改版）带来的麻烦。[1][2][3]
Sources
help
akfamily.xyz
eastmoney.com
github.com
csdn.net
github.io
cnblogs.com
proginn.com
1234567.com.cn
github.com