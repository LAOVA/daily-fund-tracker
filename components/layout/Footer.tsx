export function Footer() {
  return (
    <footer className="bg-news-bg border-t-2 border-news-border py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:border-r md:border-news-border md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              免责声明
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              本页面展示的数据仅供参考，不构成投资建议。
              基金投资有风险，入市需谨慎。
            </p>
          </div>
          <div className="md:border-r md:border-news-border md:pr-6">
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              数据来源
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              数据来源于天天基金网、东方财富等公开渠道， 仅供参考使用。
            </p>
          </div>
          <div>
            <h4 className="font-['Source_Sans_3'] text-xs font-bold text-finance-rise uppercase tracking-[0.2em] mb-3">
              联系我们
            </h4>
            <p className="text-xs text-news-muted font-['Libre_Baskerville'] leading-relaxed">
              追基日报编辑部
              <br />
              为您提供最及时的基金资讯
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
