# 项目协作说明

本文档记录对当前仓库的通读结论，供后续协作者和自动化 Agent 快速理解项目。

## 项目概览

- 这是一个个人博客站点，站点名为“小yo博客”，线上地址配置为 `https://www.smallyo.com`。
- 项目基于 Astro 5，主要使用 Astro 组件、Markdown/MDX 内容集合、TypeScript、Less 和少量浏览器端脚本。
- 博客内容集中在 `src/content/blog/`，按年份和月份组织。
- 页面风格来源于 `vhAstro-Theme` 一类的个人博客主题，并在首页、导航、页脚、暗色模式、特效等处已有自定义改动。
- 静态资源集中在 `public/`，包含图片、字体、表情包、Live Photo、下载文件、RSS 样式等。
- 部署产物目录为 `dist/`，`wrangler.jsonc` 指向 Cloudflare 静态资源部署方式。

## 技术栈与依赖

- 包管理器：建议使用 `pnpm`，仓库内有 `pnpm-lock.yaml`。
- 框架：`astro`。
- 内容扩展：`@astrojs/mdx`、`@astrojs/rss`、`@astrojs/sitemap`。
- Markdown 能力：`remark-math`、`rehype-katex`、`rehype-slug`、`remark-directive`、自定义 Markdown 插件。
- UI/交互依赖：`aplayer`、`overlayscrollbars`、`vanilla-lazyload`、`vh-plugin`、`@waline/client`。
- 构建压缩：`@playform/compress`、`astro-compressor`。
- 辅助工具：`dayjs`、`cheerio`、`reading-time`、`mdast-util-to-string`、`unist-util-visit`。

## 常用命令

```bash
pnpm run dev
pnpm run build
pnpm run preview
pnpm run newpost "文章标题"
pnpm run offdev
pnpm run ondev
```

- `pnpm run dev`：启动 Astro 开发服务器，配置中 `server.host` 为 `0.0.0.0`。
- `pnpm run build`：生成静态站点到 `dist/`。
- `pnpm run preview`：预览构建结果。
- `pnpm run newpost "文章标题"`：通过 `script/newpost.js` 创建新文章模板。
- `pnpm run offdev` / `pnpm run ondev`：关闭或开启 Astro devToolbar。

## 关键配置

- `package.json`：项目脚本和依赖声明，项目名为 `vhastro`，使用 ESM。
- `astro.config.mjs`：
  - `site` 从 `src/config.ts` 的 `Site` 字段读取。
  - 构建静态资源目录名配置为 `vh_static`。
  - 集成 sitemap、MDX、压缩和 Brotli 压缩。
  - Markdown 使用数学公式、指令块、自定义 note/button/video/music 等处理、Shiki 高亮。
  - Vite 别名 `@` 指向 `src/`。
- `src/config.ts`：站点核心配置，包括标题、作者、头像、导航、主题 CSS 变量、评论、统计、广告、SEO 推送、音乐 API 等。
- `src/content.config.ts`：定义 `blog` 内容集合和 frontmatter 校验规则。
- `wrangler.jsonc`：Cloudflare 部署配置，资源目录为 `./dist`。

## 目录结构

```text
src/
  components/      Astro 组件，包含 Header、Aside、ArticleCard、Search、Comment、Footer 等
  content/blog/    博客文章 Markdown/MDX 内容
  layouts/         页面布局，分为通用 Layout、首页 HomeLayout、PageLayout、ToolLayout
  page_data/       友链、朋友圈、动态等页面的静态数据或 API 配置
  pages/           Astro 路由页面
  plugins/         Markdown 自定义插件
  scripts/         浏览器端初始化脚本和页面交互逻辑
  styles/          全局样式、文章样式、vlook 相关样式
  utils/           文章、归档、封面、搜索、路由生命周期等工具函数
public/
  assets/          图片、字体、JS、表情、Live Photo、下载附件等静态资源
  downloads/       直接下载资源，例如 CyberLedger APK
script/
  newpost.js       新文章生成脚本
V2025.10.1/        vlook 相关脚本和语言包资源
```

## 路由与页面

- `/`：`src/pages/index.astro`，全屏首页，展示头像、作者、座右铭、站点统计和进入博客入口。
- `/blog` 和 `/blog/:page`：`src/pages/blog/[...page].astro`，分页文章列表，每页 6 篇。
- `/article/:id`：`src/pages/article/[...article].astro`，文章详情页，路由参数来自文章 frontmatter 的 `id`。
- `/archives`：归档页，按年份聚合文章。
- `/categories/:categories`：分类页。
- `/tag/:tags`：标签页。
- `/about`、`/links`、`/talking`、`/friends`、`/message`、`/404`：Markdown 页面，使用 `PageLayout` 或 `ToolLayout`。
- `/rss.xml`：RSS 输出，带 `/rss.xsl` 样式。
- `/robots.txt`：动态生成 robots 内容，并引用 sitemap。

## 内容写作规范

博客文章位于 `src/content/blog/`，通常按 `年份/月/文章名.md` 存放。frontmatter 由 `src/content.config.ts` 校验：

```yaml
---
title: "文章标题"
categories: Study
tags: ["标签"]
id: "唯一文章ID"
date: 2026-04-10 22:07:46
updated: 2026-04-11 10:00:00
cover: "封面图URL"
recommend: true
hide: false
top: false
---
```

- 必填字段：`title`、`date`、`categories`、`id`。
- 常用可选字段：`updated`、`tags`、`cover`、`recommend`、`hide`、`top`。
- `tags` 支持字符串或数字数组，但现有组件通常按字符串使用。
- `id` 是文章详情页路径的一部分，需要保持唯一。
- `cover` 为空时，`src/utils/getCover.ts` 会从 `public/assets/images/banner/` 中随机选一张图片。
- `hide: true` 的文章不会出现在博客列表和 RSS 中，但部分归档/统计工具未统一过滤隐藏文章，维护时要留意。
- `top: true` 会在博客列表中置顶；当前 `moveTopToFirst` 只移动找到的第一篇置顶文章。

## Markdown 扩展

自定义 Markdown 逻辑在 `src/plugins/markdown.custom.ts`：

- 支持 `:::note{type="success"}` 这类容器指令，渲染为带 `vh-node vh-note note-success` 等 class 的 `section`。
- 支持 `:::btn[文字]{link="链接" type="info"}`，渲染为链接按钮。
- 支持以 `vh` 开头的指令，例如 `vhVideo`、`vhMusic`，指令属性会转为 `data-*`，由浏览器脚本初始化。
- `picture` 指令会扁平化段落子节点，方便相册样式。
- 代码块会被包成 `vh-code-box` 并添加复制按钮占位。
- 图片会自动替换为懒加载占位图 `/assets/images/lazy-loading.webp`，原始地址写入 `data-vh-lz-src`。
- 插件会写入 `reading_time` 和 `article_word_count` 到文章渲染 frontmatter。

## 数据流与运行逻辑

- 文章列表页读取 `getCollection("blog")`，按日期倒序排序，再执行置顶处理和隐藏过滤。
- `src/utils/vhSearch.ts` 会基于文章渲染 HTML 生成搜索索引，目标为 `dist/vh-search.json` 和 `public/vh-search.json`。
- 搜索弹层由 `src/components/Search/Search.astro` 和 `src/scripts/Search.ts` 实现，运行时请求 `/vh-search.json`。
- 文章页使用 `render(post)` 渲染正文，读取标题列表用于右侧 TOC。
- 文章上下篇由 `src/utils/getPostInfo.ts` 的 `getPrevNextPosts` 计算。
- 分类、标签、归档由 `src/utils/getArchive.ts` 从内容集合派生。
- `src/scripts/Init.ts` 是浏览器端总入口，负责初始化搜索、懒加载、代码块、视频、音乐、评论、友链、动态、返回顶部、特效、统计等。
- Astro View Transitions 生命周期封装在 `src/utils/updateRouter.ts`，进入页面用 `astro:after-swap`，离开页面用 `astro:before-swap`，离开时会销毁评论、视频播放器和音乐播放器实例。

## 布局与组件约定

- `src/layouts/Layout/Layout.astro` 是常规页面布局，包含 Head、Header、MainHeader、Aside、TOC、Footer、BackTop 和全局初始化脚本。
- `src/layouts/HomeLayout.astro` 用于首页，全屏展示，不使用侧边栏。
- `src/layouts/PageLayout/PageLayout.astro` 用于“关于”、404 等静态内容页。
- `src/layouts/ToolLayout/ToolLayout.astro` 用于“友链”“动态”“朋友动态”“留言”等工具型页面，具体列表内容由脚本注入。
- `Header` 中导航项来自 `src/config.ts` 的 `Navs`，并包含搜索按钮、暗色模式按钮和移动端菜单按钮。
- `Aside` 中展示作者信息、公告、分类、热门标签、推荐文章和广告位。
- `Svg` 组件会从 `public/assets/images/svg/` 动态读取 SVG 原文，配置图标时只填文件名，不带扩展名。

## 静态数据与外部服务

- 友链数据：`src/page_data/Link.ts`，支持 `api` 优先，`api` 为空时使用本地 `data`。
- 朋友圈数据：`src/page_data/Friends.ts`。
- 动态说说数据：`src/page_data/Talking.ts`。
- 评论系统：`src/config.ts` 中 Waline 开启，Twikoo 关闭。Waline 服务地址配置在 `Comment.Waline.serverURL`。
- 统计系统：Han Analytics 开启，配置在 `HanAnalytics`。
- Google 广告：配置结构已存在，但 `ad_Client` 当前为空。
- SEO 推送：配置结构已存在，当前关闭。
- 音乐解析 API：`vhMusicApi` 指向 `https://vh-api.4ce.cn/blog/meting`。
- 图片和附件中有较多外链，尤其是图床 `zycs-img-2lg.pages.dev`、`wp-cdn.4ce.cn`、Google Drive 等。

## 样式与视觉

- 全局基础样式：`src/styles/Base.less`。
- 重置样式：`src/styles/Reset.less`。
- 文章内容样式：`src/styles/Article.less`、`src/styles/ArticleBase.less`。
- 各组件大多有同目录 `.less` 文件。
- 主题变量从 `src/config.ts` 的 `Theme` 注入到 `:root`。
- 首页和页脚有波浪 SVG、头像、背景图和动画效果。
- Header 有透明态、滚动后玻璃态和暗色模式切换逻辑。
- 仓库中存在 `vlook-geek.css`、`src/styles/vlook-geek.css` 和 `V2025.10.1/` 资源，布局中还引用 `/styles/vlook/vlook.css`，改动 vlook 相关资源前需要确认实际部署路径。

## 新增文章流程

1. 运行 `pnpm run newpost "文章标题"`。
2. 脚本会在 `src/content/blog/<当前年份>/<当前月份>/` 下创建 Markdown。
3. 修改 `categories`、`tags`、`cover` 和正文内容。
4. 确认 `id` 唯一；如需稳定短链接，不要随意改已有文章的 `id`。
5. 本地运行 `pnpm run dev` 或 `pnpm run build` 检查内容集合和页面渲染。

## 维护注意事项

- 不要随意清理 `public/assets/`、`V2025.10.1/`、`vlook-geek.css` 等大资源文件，很多文章或样式可能间接依赖它们。
- `src/pages/index.astro` 中首页统计使用了 `p.data.category`，而 schema 和文章实际字段是 `categories`，这会导致首页 Topics 统计不准确。修复时应改为 `p.data.categories`。
- `src/components/ArticleCard/ArticleCard.astro` 直接执行 `post.data.tags.map(...)`，但 schema 中 `tags` 是可选字段；新增文章最好始终填写 `tags`，或修组件时加默认空数组。
- `script/newpost.js` 当前对同一目标文件调用了两次 `fs.writeFile`，功能上不影响结果，但属于可清理的小重复。
- `src/utils/vhSearch.ts` 写入 `dist/vh-search.json` 时如果 `dist/` 不存在会进入 catch，并可能跳过写入 `public/vh-search.json`；改搜索生成逻辑时要注意目录存在性。
- 归档和统计工具中部分函数没有过滤 `hide` 文章；如果隐藏文章语义要严格一致，需要统一过滤策略。
- `.gitignore` 已忽略 `dist/`、`.astro/`、`node_modules/`、`/public/vh-search.json`、`.env` 等生成或本地文件。

## 协作建议

- 修改站点基础信息、导航、主题色、评论和广告时优先改 `src/config.ts`。
- 修改文章展示卡片先看 `src/components/ArticleCard/ArticleCard.astro` 和同目录 Less。
- 修改文章详情页先看 `src/pages/article/[...article].astro`、`src/styles/Article.less`、`src/styles/ArticleBase.less`。
- 修改全站布局先看 `src/layouts/Layout/Layout.astro` 和 `src/layouts/Layout/Layout.less`。
- 修改浏览器端交互先确认是否已经在 `src/scripts/Init.ts` 中统一初始化。
- 新增可复用视觉组件时延续“组件目录内 Astro + Less”的结构。
- 内容类改动优先保持现有 frontmatter 字段和指令写法，避免破坏既有文章。
