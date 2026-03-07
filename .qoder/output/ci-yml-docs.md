# GitHub Actions CI/CD 工作流说明

## 文件位置

`.github/workflows/deploy.yml`

## 工作流概述

本工作流用于将 Next.js 项目自动部署到 GitHub Pages。

## 触发条件

- 当代码推送到 `master` 分支时触发

## 工作流程

### 1. build job（构建 job）

| 步骤                 | 说明                                    |
| -------------------- | --------------------------------------- |
| Checkout             | 检出代码仓库                            |
| Setup Node           | 配置 Node.js 20 环境，使用 npm 缓存加速 |
| Install dependencies | 安装项目依赖 (`npm ci`)                 |
| Build                | 执行构建 (`npm run build`)              |
| Upload artifact      | 上传构建产物（./out 目录）              |

### 2. deploy job（部署 job）

| 步骤                   | 说明                          |
| ---------------------- | ----------------------------- |
| Deploy to GitHub Pages | 将构建产物部署到 GitHub Pages |

- 依赖 `build` job，必须等构建完成后才能部署

## Next.js 静态导出配置

在 `next.config.ts` 中配置了以下选项：

| 配置                              | 作用                           |
| --------------------------------- | ------------------------------ |
| `output: 'export'`                | 启用静态导出模式               |
| `trailingSlash: true`             | URL 添加尾斜杠，避免 404       |
| `images.unoptimized: true`        | 禁用图片优化（静态导出不支持） |
| `basePath: '/daily-fund-tracker'` | 设置站点基础路径               |

## 注意事项

1. 仓库需要设为 **公开(public)** 才能使用免费的 GitHub Pages
2. 首次部署后需要在 Settings → Pages 中确认 Source 为 GitHub Actions
3. 部署完成后访问：`https://<用户名>.github.io/fund-tracker/`

