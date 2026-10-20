# element-like

一个仿 Element UI / Element Plus 的 Vue 3 组件库项目：从零封装常用 UI 组件，配套设计 token 体系、组件文档与单元测试。

## 技术栈

- **Vue 3** + **TypeScript** + **Vite**（支持 JSX/TSX）
- **SCSS** 设计 token 体系（CSS 自定义属性，命名对齐 Element Plus 的 `--el-*`）
- **Vitest** + @vue/test-utils + jsdom（单元测试）
- **oxlint** + **ESLint** + **Prettier**（双 linter 依次自动修复，格式化由 Prettier 负责）
- 图标基于 font-awesome 二次封装

## 环境要求

- Node.js `^22.18.0 || >=24.12.0`
- 包管理器：**pnpm**

## 快速开始

```sh
pnpm install     # 安装依赖
pnpm dev         # 启动开发服务器（组件示例页）
pnpm build       # 类型检查 + 生产构建（并行）
pnpm build:lib   # 组件库打包（ES + UMD 双格式 + 样式产物）
pnpm vitest run  # 一次性运行单元测试（pnpm test:unit 为 watch 模式）
pnpm lint        # oxlint + ESLint 依次自动修复
pnpm format      # Prettier 格式化（只覆盖 src/）
```

## 组件库打包

组件库支持以 npm 包形式发布（ES + UMD 双格式，含样式产物）。打包体系、依赖分层策略与日常维护约定（增删组件、调整依赖时的联动修改点）详见 [docs/packaging.md](docs/packaging.md)；**在新项目中使用组件库**（安装、全量/按需注册、图标机制、常见问题）见 [docs/usage.md](docs/usage.md)。

## 组件列表

组件以 `ElLike-` 前缀全局注册（与 Element Plus 的 `app.use` 消费方式对齐），模板中使用小写标签 `<el-like-button>`，无需 import；按需导入的具名导出为 PascalCase（`import { ElLikeButton } from 'element-like'`，对齐 Element Plus 的 `ElButton`），导入名与模板标签一一对应。每个组件的详细用法与 API 见其目录下的 README。

- ✅ **Icon 图标** —— 对 font-awesome 的二次封装，详见 [src/components/Icon/README.md](src/components/Icon/README.md)
- ✅ **Button 按钮** —— 支持主题、尺寸、图标及加载状态，详见 [src/components/Button/README.md](src/components/Button/README.md)
- ✅ **Card 卡片** —— 支持图片、尺寸、摘要及内容插槽，详见 [src/components/Card/README.md](src/components/Card/README.md)
- ✅ **Dialog 对话框** —— 支持受控显示、自定义内容及关闭配置，详见 [src/components/Dialog/README.md](src/components/Dialog/README.md)
- ✅ **Pager 分页** —— 支持受控当前页、页码窗口折叠与省略号快速跳转，详见 [src/components/Pager/README.md](src/components/Pager/README.md)
- ✅ **Collapse 折叠面板** —— 含 CollapseItem，支持手风琴模式、自定义标题与禁用面板，详见 [src/components/Collapse/README.md](src/components/Collapse/README.md)
- ✅ **Tooltip 文字提示** —— 支持 hover / click / focus 三种触发方式、延时与手动控制、自动翻转定位，详见 [src/components/Tooltip/README.md](src/components/Tooltip/README.md)
- ✅ **Dropdown 下拉菜单** —— 复用 Tooltip 的显示/定位机制，选择条目触发 select 事件，详见 [src/components/Dropdown/README.md](src/components/Dropdown/README.md)

各组件的示例页（`src/views/*View.vue`）已接入路由，可在开发服务器中预览。

## 目录结构

```text
src/
├── components/      # 组件库源码（每个组件一个目录，内含组件、props 定义与 README）
│   └── Icon/
├── views/           # 组件示例页（开发预览用，按组件一一对应）
├── styles/          # 设计 token（vars.scss）+ 全局重置（reset.scss），详见其 README
├── router/          # 示例页路由（meta.label 驱动导航，增删组件页自动同步）
└── __tests__/       # 单元测试
```

## 开发约定

- **样式**：组件样式一律通过 `var(--el-*)` 消费设计 token，禁止手写色值；token 体系的设计决策见 [src/styles/README.md](src/styles/README.md)
- **路径别名**：`@/*` → `./src/*`，优先使用别名而非深层相对导入
- **提交信息**：遵循 Conventional Commits (Angular) 规范，subject 用中文、动词开头
