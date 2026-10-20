# 组件库打包指南

本文档描述 element-like 作为 npm 组件库的打包体系：产物结构、文件职责、依赖分层，以及日常维护（增删组件、调整依赖）时**必须同步修改的位置**。维护前请先通读「⚠️ 联动约定」。

## 产物概览

打包输出 **ES Module** 与 **UMD** 两种格式，分别面向两类使用方：

| 使用方 | 格式 | 产物 | 特点 |
| --- | --- | --- | --- |
| 现代构建工具（Vite/webpack/Rollup） | ES | `dist/es/element-like.js` | 对等依赖全部 external，产物 ~20 kB，支持按需导入 tree-shaking |
| CDN / `<script>` 直接引入 | UMD | `dist/umd/element-like.umd.cjs` | 除 vue 外全部打进产物（~1 MB，fontawesome 全量图标所致，属预期） |

样式统一抽取为 `style.css`，随两种格式各产出一份；另提升一份到 `dist/` 根目录供「只引样式」场景使用（见下方目录树）。

```text
dist/
├── es/
│   ├── element-like.js        # ES 包体
│   └── style.css              # ES 样式
├── umd/
│   ├── element-like.umd.cjs   # UMD 包体（全局变量 ElementLike）
│   └── style.css              # UMD 样式
└── style.css                  # ← move-style 脚本从 dist/es/style.css 复制而来
```

## 文件职责

| 文件 | 职责 |
| --- | --- |
| [src/bundle.ts](../src/bundle.ts) | 库统一入口：聚合全部组件与全局样式，导出 `install`（全量安装）+ 各组件具名导出（按需，PascalCase 命名对齐 Element Plus） |
| [src/bundle.d.ts](../src/bundle.d.ts) | 公共类型声明：与 bundle.ts 导出逐一对应，含 `declare module 'vue'` 的 GlobalComponents 增强（使用方模板标签获得 Volar 解析与提示） |
| [src/components/withInstall.ts](../src/components/withInstall.ts) | `withInstall` 装配函数：为组件附加 `install`（注册原始名 + 去连字符别名），全量与按需安装共用 |
| [src/components/\*/index.ts](../src/components/Button/index.ts) | 各组件按需安装入口：`app.use(ElLikeButton)` 单独注册；带内部图标依赖的组件在此补齐最小图标注册 |
| [vite.es.config.ts](../vite.es.config.ts) | ES 格式打包配置（`vite build --config` 指定，不影响演示应用的 [vite.config.ts](../vite.config.ts)） |
| [vite.umd.config.ts](../vite.umd.config.ts) | UMD 格式打包配置 |
| [scripts/move-style.mjs](../scripts/move-style.mjs) | 把 `dist/es/style.css` 复制到 `dist/style.css`（Node 原生实现，无第三方依赖） |
| [scripts/copy-types.mjs](../scripts/copy-types.mjs) | 把 `src/bundle.d.ts` 复制到 `dist/es` 与 `dist/umd`，供 `types` 字段与 exports 的 types 条件引用 |
| [package.json](../package.json) | 入口字段（`main`/`module`/`types`/`exports`）、`files`、依赖分层、`build:lib` 系列脚本 |

```text
pnpm build:lib
  = pnpm build-es    (vite build --config vite.es.config.ts)
  → pnpm build-umd   (vite build --config vite.umd.config.ts)
  → pnpm move-style  (node scripts/move-style.mjs)
  → pnpm copy-types  (node scripts/copy-types.mjs)
```

注意与演示应用构建区分：**`pnpm build` 是演示应用构建**（类型检查 + vite build 示例页），**`pnpm build:lib` 才是库打包**。

## 依赖分层

同一份 package.json 既服务演示应用开发，又是发布包清单，三类依赖各司其职：

| 位置 | 内容 | 原因 |
| --- | --- | --- |
| `dependencies` | fontawesome 三件套 | 库运行时依赖（入口注册图标、Icon 组件渲染依赖）。放这里使用方 `npm install` 时自动装上 |
| `peerDependencies` | `vue` | 对等依赖：要求使用方自行安装 Vue，**发布时不会替使用方装**。ES 构建因此将 vue 标记 external，避免库内嵌一份 Vue 造成实例不一致 |
| `devDependencies` | `vue`、`vue-router`、构建/测试工具链 | 仅供本仓库的演示应用与开发流程使用。`vue` 同时出现在 devDependencies 是为本地开发与测试；`vue-router` 仅示例页路由用到，组件库本体不依赖 |

## 维护操作

### 新增组件（同步修改 5 处）

1. **建按需安装入口**：新建 `src/components/Xxx/index.ts`，内容为 `export default /* @__PURE__ */ withInstall(Xxx)`——**PURE 注解不可省略**（原因见「按需安装机制」）；组件内部若渲染图标（如 Button 的 loading），在 `setup` 里注册 `font-awesome-icon` 与所用图标（只注册内部用到的几个，保持 tree-shake）
2. **登记入口**：[src/bundle.ts](../src/bundle.ts) 中
   - `import ElLikeXxx from './components/Xxx'`（从 index.ts 导入，而非 .vue）
   - 加入 `componentArr` 数组（决定 `app.use` 全量注册范围）
   - 追加到末尾的按需导出列表 `export { ... }` 与默认导出对象
3. **登记类型**：[src/bundle.d.ts](../src/bundle.d.ts) 中追加 `ElLikeXxx` 的导出声明、默认导出对象与 GlobalComponents 增强（三处）
4. **确认组件名**：组件的 `defineOptions({ name: 'ElLike-Xxx' })` 必须存在——`install` 依赖 `component.name` 做全局注册（withInstall 有兜底守卫，未声明 name 的组件会被静默跳过，务必补齐）
5. **登记样式**：组件样式若在 [src/styles/](../src/styles/) 体系内，需 `@use` 进 [src/styles/index.scss](../src/styles/index.scss)（这是库样式唯一入口，构建时抽取为 style.css）

## 按需安装机制

每个组件目录的 index.ts 用 [withInstall.ts](../src/components/withInstall.ts) 为组件装配 `install`（注册原始名 + 去连字符别名），使用方可 `import { ElLikeButton } from 'element-like'` 后 `app.use(ElLikeButton)` 单独注册；未用到的组件由构建工具 tree-shake 掉。

- **`/* @__PURE__ */` 注解是 tree-shake 的关键**：`withInstall` 是属性赋值调用，不加注解会被打包器视为有副作用而整体保留，连带打进全部组件与 fas 图标库（Button-only 产物体积 1.1MB → 159kB 的差别，已用消费测试项目的 `tree-shake.js` 入口实测验证）。
- **内部图标依赖最小注册**：Button 的 loading 依赖 spinner 图标，其 index.ts 的 setup 只注册 `faSpinner` + `font-awesome-icon`；Icon 的 install 注册全量 fas（图标名是运行时动态的，无法按名摇树）。**用户自定义图标名**（Button 的 icon、Dropdown 菜单项的 icon）需要使用方自行注册图标（`app.use(ElLikeIcon)` 或自行 `library.add`）。
- 全量安装（`app.use(ElementLike)`）逐个调用组件的 install，与按需安装走同一套逻辑，行为一致。

## CDN 使用指南

通过 `<script>` 直接引入 UMD 产物，无需构建工具。完整最小示例：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <!-- 样式必须手动引入：UMD 不会自动带样式 -->
    <link rel="stylesheet" href="https://unpkg.com/element-like/dist/umd/style.css" />
  </head>
  <body>
    <div id="app">
      <el-like-button type="primary">按钮</el-like-button>
      <el-like-icon icon="house"></el-like-icon>
    </div>

    <!-- 先挂 Vue 全局，再挂组件库（顺序不可颠倒） -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
    <script src="https://unpkg.com/element-like/dist/umd/element-like.umd.cjs"></script>
    <script>
      const app = Vue.createApp({})
      app.use(ElementLike) // 全量安装；UMD 的全局对象名为 ElementLike
      app.mount('#app')
    </script>
  </body>
</html>
```

### 注意事项

- **标签必须全小写（kebab-case）**：浏览器 HTML 解析器会把标签强制小写，写 `<ElLike-Button>` 也会变成 `<el-like-button>`。解析链路与去连字符别名的来由见「已知坑位备忘」。
- **必须显式写闭合标签**：HTML 解析器不支持自定义元素的 `/>` 自闭合，`<el-like-icon icon="house" />` 会把后续内容吞进该元素内部，必须写成 `<el-like-icon icon="house"></el-like-icon>`。
- **引入顺序**：`vue.global.js` 必须在 `element-like.umd.cjs` 之前——UMD 产物把 vue 映射为全局变量 `Vue`，先加载组件库会直接报 `Vue is not defined`。
- **样式单独引入**：JS 与 CSS 是两份产物，`<link>` 指向 `dist/umd/style.css`（ES 用户则走包的 `element-like/style.css` 子路径）。
- **静态服务器需为 .cjs 提供 JS MIME**：常规静态服务器（如 `python -m http.server`）会把 .cjs 当作 octet-stream 返回，浏览器拒绝执行。真实 CDN（unpkg/jsdelivr）已处理；本地测试请用 `cdn-test/server.mjs`（见「本地验证设施」）。
- **生产版 Vue 静默失败**：`vue.global.prod.js` 剥离了「Failed to resolve component」等警告，组件名写错时表现为一个空壳自定义元素、控制台无任何报错。排查模板解析问题请临时换成 `vue.global.js`（开发版）。
- **体积预期**：UMD ~1 MB（gzip ~320 kB），因内含全量 solid 图标库，为 CDN 开箱即用有意为之。
- **部分注册**：除 `app.use(ElementLike)` 全量安装外，也可 `app.use(ElementLike.ElLikeButton)` 只注册单个组件（CDN 场景包体已固定，节省的是注册开销而非体积）。

### 新增运行时依赖

- **库本体用到** → 放入 `dependencies`（fontawesome 同级），并在 [vite.es.config.ts](../vite.es.config.ts) 的 `rollupOptions.external` 中登记——ES 产物必须外置它
- **演示应用用到、库本体不用** → 放入 `devDependencies`
- **需要使用方自行安装** → 放入 `peerDependencies` 并 external
- UMD 侧策略不同：仅 vue external，其余全部打进产物（CDN 场景无模块解析能力，须开箱即用）。新增依赖会自动被 UMD 打进，无需登记

## ⚠️ 联动约定（改一处必改它处）

| 改动 | 必须同步 |
| --- | --- |
| 改 `lib.fileName`（现为 `element-like`） | package.json 的 `main`/`module`/`exports` 中所有产物路径 |
| 改 `lib.cssFileName`（现固定为 `style`） | package.json `exports` 的 `./style.css` 路径 + `scripts/move-style.mjs` 中的源路径 |
| 移动/重命名 `src/bundle.ts` | 两份打包配置中的 `lib.entry` |
| 删除组件 | bundle.ts 三处登记同步移除；若删除后 styles 目录残留其 scss，需同步从 index.scss 摘除 |

## 已知坑位备忘

- **Vite 8 lib 模式默认 CSS 产物名是 `<fileName>.css`**（即 `element-like.css`），不是历史版本的 `style.css`。因此两份配置里显式声明了 `cssFileName: 'style'`——删掉它会导致 move-style 失败、`./style.css` 导出路径失配。
- **`dist/style.css` 是脚本复制的产物**，不在任何 vite 构建的 outDir 内。手改它无效，源在 `dist/es/style.css`。
- **UMD ~1 MB 是刻意的**：`library.add(fas)` 全量注册 solid 图标（约 2k 个）。在意体积请走 ES 按需导入；不要试图在 UMD 里 external fontawesome（CDN 场景没有可靠全局变量可映射）。
- **组件注册名带连字符（`ElLike-Button`）与 DOM 模板不兼容**：浏览器会把 HTML 标签全小写化，Vue 对 `<el-like-button>` 的解析候选是小写/驼峰/首字母大写三种形式，均不含连字符。因此 [withInstall.ts](../src/components/withInstall.ts) 除原始名外**追加注册了去连字符别名**（`ElLikeButton`），SFC 与 CDN/DOM 两种消费方式均能命中。删除别名注册会破坏 CDN 场景（已用 `cdn-test/` 冒烟页验证）。
- **DOM 模板不支持自定义元素的 `/>` 自闭合**：HTML 解析器会把后续内容嵌套进该元素。CDN 使用方的模板必须显式写闭合标签（`<el-like-icon ...></el-like-icon>`）。
- **`pnpm link` 软连接联调会出现两份 Vue**：库产物把 vue 标记为 external，通过 `link:`/`pnpm link` 链接时 `import 'vue'` 沿库的真实路径解析到库自身的 node_modules，与使用方的 vue 形成两份副本，挂载时报 `Cannot read properties of null (reading 'ce')`。使用方构建配置加 `resolve.dedupe: ['vue']` 即可（见消费测试项目的 vite.config.js）；从 registry / `file:` 安装时 pnpm 统一处理对等依赖，无此问题。
- `library` 是单例，入口重复 `library.add(fas)` 幂等，不会与使用方自己的图标注册冲突。
- 两种格式共用同一份 `publicDir: false`（组件库无静态资源，演示应用才有 public 目录）。

## 本地验证设施

- **CDN 冒烟测试**（`cdn-test/`，不入库）：`node cdn-test/server.mjs` 后访问 <http://localhost:5199/> —— 以 `<script>` 全局方式消费 UMD 产物，覆盖全部 9 个组件（含 Dialog 打开、Dropdown 展开），页面本身也是「CDN 使用指南」注意事项的活例子。修改打包产物后用它回归 CDN 链路。
- **软连接消费测试**（仓库外 `Desktop/element-like-consumer/`）：`pnpm link ../element-like` 建立的消费方项目，走 `exports` 的 ESM 入口 + `style.css` 子路径，覆盖全量安装与按需导入两条路径。

## 发布前检查清单

- [ ] `version` 已按语义化版本 bump（当前仓库默认保留开发版本号）
- [ ] `license` 字段已按发行意愿补充
- [ ] `pnpm build:lib` 通过，产物目录与上文一致
- [ ] `pnpm pack` 后用 `--dry-run` 或解包确认 `files: ["dist"]` 只发布产物
- [ ] 演示构建 `pnpm build` 与单测 `pnpm vitest run` 通过（打包改动不影响开发链路）
