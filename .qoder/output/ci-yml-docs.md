# GitHub Actions CI/CD 工作流说明

## 文件位置

`.github/workflows/deploy.yml`

## 工作流概述

本工作流用于将 Next.js 项目自动部署到 GitHub Pages。

## 完整配置说明

### 顶层配置

```yaml
name: Deploy to GitHub Pages
```

- **name**: 工作流的名称，显示在 GitHub Actions 页面中

```yaml
on:
  push:
    tags:
      - "v*"
```

- **on**: 触发条件
  - `push`: 推送事件
  - `tags`: 推送标签
  - `'v*'`: 以 "v" 开头的标签（如 v1.0、v1.0.1、v2.0.0）

> 注意：打标签需要在本地执行 `git tag v1.0.0` 然后 `git push --tags`，或直接在 GitHub 上创建 Release

### 权限配置

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

- **permissions**: 设置工作流的权限（最小权限原则）
  - `contents: read`: 读取仓库内容（用于检出代码）
  - `pages: write`: 写入 GitHub Pages（用于部署）
  - `id-token: write`: 写入 ID token（用于 OIDC 认证）

### 并发控制

```yaml
concurrency:
  group: "pages"
  cancel-in-progress: false
```

- **concurrency**: 控制并发构建
  - `group: "pages"`: 同一时间只允许一个 "pages" 相关的构建运行
  - `cancel-in-progress: false`: 如果有新推送，不取消当前正在进行的部署，确保部署顺序一致

---

## Jobs 详解

### 1. build job（构建 job）

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
```

- **jobs**: 工作流中的作业集合
- **build**: job 的 ID 名称
- **runs-on**: 运行作业的虚拟机镜像

#### Steps 步骤

##### Checkout

```yaml
- name: Checkout
  uses: actions/checkout@v4
```

- **uses**: 使用现成的 Action
- **actions/checkout@v4**: 检出仓库代码到工作流环境
  - v4 是稳定版本

##### Setup Node

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "npm"
```

- **actions/setup-node@v4**: 设置 Node.js 环境
  - `node-version: 20`: 使用 Node.js 20 版本
  - `cache: "npm"`: 启用 npm 缓存，加速依赖安装

##### Install dependencies

```yaml
- name: Install dependencies
  run: npm ci
```

- **run**: 执行 shell 命令
- `npm ci`: _clean install_，根据 package-lock.json 安装依赖（比 npm install 更适合 CI 环境）

##### Build

```yaml
- name: Build
  run: npm run build
```

- 执行 `npm run build`，调用 package.json 中的 build 脚本，执行 Next.js 构建

##### Upload artifact

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./out
```

- **actions/upload-pages-artifact@v3**: 上传构建产物，供后续部署步骤使用
  - `path: ./out`: Next.js 静态导出的输出目录

---

### 2. deploy job（部署 job）

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
```

- **needs: build**: 依赖 build job，必须等构建完成后才能部署

#### Steps 步骤

##### Deploy to GitHub Pages

```yaml
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

- **actions/deploy-pages@v4**: GitHub 官方部署 Action，将上传的 artifact 部署到 GitHub Pages
- **id: deployment**: 给这个步骤设置 ID，方便在其他地方引用其输出

---

## 完整工作流执行流程

```
1. 创建并推送标签 (git tag v1.0.0 && git push --tags)
       ↓
2. 触发工作流
       ↓
3. [build job] 检出代码
       ↓
4. [build job] 设置 Node.js 20 环境
       ↓
5. [build job] 安装依赖 (npm ci)
       ↓
6. [build job] 构建项目 (npm run build)
       ↓
7. [build job] 上传构建产物到 artifact
       ↓
8. [deploy job] 等待 build 完成
       ↓
9. [deploy job] 部署 artifact 到 GitHub Pages
       ↓
10. 访问 https://laova.github.io/daily-fund-tracker/
```

---

## 如何触发部署

### 方式一：本地打标签

```bash
# 1. 确保代码已提交
git add .
git commit -m "feat: new feature"

# 2. 创建标签
git tag v1.0.0

# 3. 推送标签到远程
git push --tags
```

### 方式二：GitHub Release

在 GitHub 仓库页面点击 → Releases → Draft a new release

填写版本号（如 v1.0.0）→ Publish release

> 标签命名建议遵循语义化版本规范：v 主版本.次版本.修订号

---

## Next.js 静态导出配置

在 `next.config.ts` 中配置了以下选项：

| 配置                       | 作用                                                      |
| -------------------------- | --------------------------------------------------------- |
| `output: 'export'`         | 启用静态导出模式                                          |
| `trailingSlash: true`      | URL 添加尾斜杠，避免 404                                  |
| `images.unoptimized: true` | 禁用图片优化（静态导出不支持）                            |
| `basePath`                 | 设置站点基础路径（production 环境为 /daily-fund-tracker） |

---

## 常见问题

### Q: 为什么用 npm ci 而不是 npm install？

- `npm ci` 直接根据 package-lock.json 安装，删除 node_modules 后重新安装，速度更快且更可靠
- 适合 CI/CD 环境，确保依赖版本一致性

### Q: concurrency 有什么用？

- 防止多次推送导致部署顺序混乱
- 设为 `cancel-in-progress: false` 确保部署是队列执行的

### Q: 为什么需要两个 job？

- **build**: 负责构建，生成静态文件
- **deploy**: 负责部署，将静态文件发布到 Pages
- 分离构建和部署是最佳实践，便于调试和复用

### Q: permissions 为什么这样设置？

- GitHub Actions 默认所有权限为 none
- 设置最小权限：只读 contents（读取代码）、读写 pages（部署页面）、写 id-token（OIDC 认证）

### Q: 为什么要用标签触发而不是每次 push？

- 避免开发过程中的频繁部署
- 只有正式发布的版本才部署到生产环境
- 更符合发布流程规范

### Q: 标签命名规则是什么？

- `'v*'` 表示匹配所有以 "v" 开头的标签
- 常见命名：v1.0.0、v1.1、v2.0.0-beta

---

## 注意事项

1. 仓库需要设为 **公开(public)** 才能使用免费的 GitHub Pages
2. 首次部署后需要在 Settings → Pages 中确认 Source 为 GitHub Actions
3. 部署完成后访问：`https://laova.github.io/daily-fund-tracker/`
