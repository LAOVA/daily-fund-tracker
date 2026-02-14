# 基金估值追踪

一个基于 Next.js 的基金实时估值与持仓追踪平台，采用报纸杂志风格设计。

![基金估值追踪](https://img.shields.io/badge/Next.js-16-blue)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue)

## 功能特性

### 实时估值
- 搜索并添加自选基金
- 实时显示基金估值净值、涨跌幅
- 查看昨日净值、昨日涨幅
- 近一周、近一月、今年来收益率

### 重仓追踪
- 查看每只基金的重仓股票明细
- 显示持仓比例和当日涨跌幅
- 可折叠展开查看详情

### 组合管理
- 创建自定义基金分组
- 将基金添加到不同分组
- 管理自选基金列表

### 自动刷新
- 支持自动刷新数据
- 可自定义刷新间隔（5-300秒）
- 手动刷新按钮

### 数据持久化
- 自选基金和分组数据自动保存到本地存储
- 刷新页面后数据不丢失

## 技术栈

- **框架**: [Next.js](https://nextjs.org/) 16.1.6
- **UI库**: [React](https://react.dev/) 19.2.3
- **语言**: [TypeScript](https://www.typescriptlang.org/) 5.x
- **样式**: [Tailwind CSS](https://tailwindcss.com/) 4.x
- **状态管理**: [Zustand](https://github.com/pmndrs/zustand) 5.x
- **UI组件**: [shadcn/ui](https://ui.shadcn.com/)
- **图表**: [Chart.js](https://www.chartjs.org/) 4.x + react-chartjs-2
- **图标**: [Lucide React](https://lucide.dev/)

## 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建生产版本

```bash
npm run build
# 或
yarn build
# 或
pnpm build
```

### 启动生产服务器

```bash
npm start
# 或
yarn start
# 或
pnpm start
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页（实时估值）
│   ├── holdings/          # 重仓追踪页面
│   │   └── page.tsx
│   └── portfolio/         # 组合管理页面
│       └── page.tsx
├── components/            # React 组件
│   ├── funds/            # 基金相关组件
│   │   ├── FundSearch.tsx      # 基金搜索组件
│   │   └── ValuationTable.tsx  # 估值表格组件
│   ├── layout/           # 布局组件
│   │   └── Header.tsx         # 顶部导航栏
│   └── ui/               # shadcn/ui 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── slider.tsx
│       ├── switch.tsx
│       └── table.tsx
├── lib/                   # 工具函数和数据获取
│   ├── utils.ts          # 通用工具函数
│   └── useFundData.ts    # 基金数据获取逻辑
├── stores/                # Zustand 状态管理
│   ├── fundsStore.ts     # 基金数据状态
│   └── settingsStore.ts  # 设置状态
├── public/                # 静态资源
├── package.json           # 项目依赖
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明
```

## 数据来源

本项目通过客户端 JSONP 方式获取数据：

- **基金估值数据**: 天天基金网 (fundgz.1234567.com.cn)
- **历史净值数据**: 天天基金网 (fund.eastmoney.com)
- **基金持仓数据**: 天天基金网 (fundf10.eastmoney.com)
- **股票行情数据**: 腾讯股票接口 (qt.gtimg.cn)
- **基金搜索**: 天天基金搜索 API (fundsuggest.eastmoney.com)

## 页面说明

### 实时估值 (`/`)
首页展示自选基金的实时估值信息，包括：
- 基金名称和代码
- 昨日净值、估值净值
- 估值涨跌幅（红涨绿跌）
- 历史收益率（昨日、近一周、近一月、今年来）

右侧边栏包含：
- 刷新设置（自动刷新开关、刷新间隔）
- 市场快讯（预留接口）
- 板块行情（预留接口）

### 重仓追踪 (`/holdings`)
查看每只自选基金的重仓股票：
- 显示基金名称和代码
- 列出前10大重仓股
- 显示每只股票的持仓比例
- 显示当日涨跌幅

### 组合管理 (`/portfolio`)
管理基金分组：
- 创建新分组
- 查看各分组内的基金
- 从分组中删除基金
- 删除分组

## 设计特色

本项目采用**报纸杂志风格**设计：

- **配色方案**: 暖色调（米白背景、深褐文字、红色强调）
- **字体**: Playfair Display（标题）、Libre Baskerville（正文）、Source Sans 3（UI）
- **边框**: 3px 粗细的边框，营造印刷质感
- **布局**: 响应式网格布局，支持桌面和移动端

## 自定义配置

### 修改刷新间隔
在首页右侧"刷新设置"面板中：
1. 开启"自动刷新"开关
2. 拖动滑块设置刷新间隔（5-300秒）

### 添加自选基金
1. 在首页搜索框输入基金代码或名称
2. 从下拉列表中选择基金
3. 点击基金添加到自选列表

### 删除基金
在估值表格或组合管理页面，点击基金右侧的删除按钮即可移除。

## 开发说明

### 状态管理
使用 Zustand 进行状态管理：

```typescript
// 基金数据状态
const { watchlist, groups, addFund, removeFund } = useFundsStore();

// 设置状态
const { autoRefresh, refreshInterval, setAutoRefresh } = useSettingsStore();
```

### 数据获取
基金数据通过客户端 JSONP 方式获取：

```typescript
import { fetchFullFundData } from '@/lib/useFundData';

const data = await fetchFullFundData('000001');
// 返回：{ code, name, previousNetAssetValue, estimatedNetValue, estimatedGrowthRate, ... }
```

### 样式定制
Tailwind CSS 配置在 `globals.css` 中，自定义颜色：

```css
:root {
  --main-bg: #FFFEFB;
  --text-primary: #2D2A26;
  --text-secondary: #6B6560;
  --accent-red: #C41E3A;
  --accent-green: #228B22;
  --border-color: #C9C2B5;
  --muted-bg: #F5F0E6;
}
```

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 注意事项

1. **数据来源**: 本项目仅用于学习目的，数据来源于第三方公开接口，不保证数据的实时性和准确性。
2. **投资风险**: 基金投资有风险，本工具仅供参考，不构成投资建议。
3. **网络请求**: 由于采用客户端 JSONP 方式获取数据，请确保网络环境可以访问天天基金网和腾讯股票接口。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [天天基金网](https://fund.eastmoney.com/) 提供数据接口
