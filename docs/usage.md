# element-like 使用指南

面向**消费方**（使用本组件库的业务项目）的接入文档：从安装、样式引入，到全量/按需两种注册方式与图标使用。各组件的 props、插槽等 API 细节见对应组件目录的 README；打包体系与 CDN 直引见 [packaging.md](./packaging.md)。

## 环境要求

- **Vue** `^3.5.0`（peerDependency，由使用方自行安装）
- **Node** `^22.18.0 || >=24.12.0`（包 engines 声明，低于此版本安装时会告警）
- 支持 ESM 的构建工具（Vite / webpack / Rollup）；不经构建、以 `<script>` 直引的 CDN 场景见 [packaging.md 的 CDN 使用指南](./packaging.md#cdn-使用指南)

## 安装

### 从 registry 安装（正式发布后）

```sh
pnpm add element-like
```

### 本地开发联调（未发布时）

先在组件库仓库打出 dist 产物（消费方走的是 `package.json` exports 指向的 dist 文件，不打就引用不到）：

```sh
cd element-like && pnpm build:lib
```

再二选一接入：

```sh
# 方式一：软链接（改库代码后重新 build:lib 即生效）
cd your-project && pnpm link ../element-like

# 方式二：file: 安装
pnpm add file:../element-like
```

> **注意**：`pnpm link` 软链接方式下，库产物把 vue 标记为 external，`import 'vue'` 会沿库的真实路径解析到库自身的 node_modules，与使用方的 Vue 形成两份副本，挂载时报 `Cannot read properties of null (reading 'ce')`。使用方构建配置加一行即可解决：
>
> ```ts
> // vite.config.ts
> export default defineConfig({
>   resolve: { dedupe: ['vue'] },
> })
> ```
>
> 从 registry / `file:` 安装时由包管理器统一处理对等依赖，无此问题。

## 引入样式

JS 与 CSS 是两份独立产物。全部组件样式聚合在一个 `style.css`（约 25 kB / gzip 4 kB），按需注册同样整份引入，入口处引一次即可：

```ts
import 'element-like/style.css'
```

## 全量注册（推荐，对齐 element-ui 的 `Vue.use(ElementUI)`）

```ts
import { createApp } from 'vue'
import ElementLike from 'element-like'
import 'element-like/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementLike)
app.mount('#app')
```

模板中直接使用小写标签，无需 import 组件；图标库随全量注册一并就绪：

```vue
<template>
  <el-like-button type="primary" icon="paper-plane">发送</el-like-button>
  <el-like-button type="success" icon="check">完成</el-like-button>
</template>
```

## 按需注册（对齐 element-plus，tree-shaking）

具名导出为 PascalCase（对齐 Element Plus 的 `ElButton` 命名），`app.use` 单独注册，未用到的组件由构建工具 tree-shake 掉：

```ts
import { ElLikeButton, ElLikeIcon } from 'element-like'
import 'element-like/style.css'

app.use(ElLikeButton)
app.use(ElLikeIcon)
```

**模板写法与全量注册完全一致**——两种方式共用同一套 `withInstall` 装配，注册的组件名与别名相同，只是注册范围不同。默认导出同样携带全部组件，也可 `app.use(ElementLike.ElLikeButton)` 单独安装（CDN 场景的「部分注册」用法）。

体积参考（本仓库 tree-shake 实测）：只打包 Button 约 159 kB；连带全量 fas 图标约 1.1 MB；ES 库本体约 20 kB（gzip 6.3 kB）。

### 导出名与模板标签对照

| 具名导出 | 模板标签 | 说明 |
| --- | --- | --- |
| `ElLikeIcon` | `<el-like-icon>` | 图标组件；install 附带注册全量 solid 图标库 |
| `ElLikeButton` | `<el-like-button>` | 按钮；install 附带注册 loading 所需 spinner 图标 |
| `ElLikeCard` | `<el-like-card>` | 卡片 |
| `ElLikeDialog` | `<el-like-dialog>` | 对话框 |
| `ElLikePager` | `<el-like-pager>` | 分页 |
| `ElLikeCollapse` | `<el-like-collapse>` | 折叠面板（配合 CollapseItem 使用） |
| `ElLikeCollapseItem` | `<el-like-collapse-item>` | 折叠面板项 |
| `ElLikeTooltip` | `<el-like-tooltip>` | 文字提示 |
| `ElLikeDropdown` | `<el-like-dropdown>` | 下拉菜单 |

每个组件同时注册原始名（`ElLike-Button`）与去连字符别名（`ElLikeButton`），因此 SFC 模板里 `<ElLikeButton>` 与 `<el-like-button>` 两种写法均可用；DOM 模板（CDN 场景，浏览器会把标签小写化）只能写小写。注意多词组件的小写标签按单词断连字符：`<el-like-collapse-item>`（写成 `<el-like-collapseitem>` 解析不到注册名）。

## 图标

图标基于 font-awesome **solid** 图标集二次封装，业务侧只传图标名（不含 `fa-` 前缀）：

```vue
<el-like-button type="danger" icon="trash">删除</el-like-button>
<el-like-icon icon="house" />
```

| 注册方式 | 可用图标 |
| --- | --- |
| 全量 `app.use(ElementLike)` | 全量 solid 图标（约 2k 个） |
| 按需 `app.use(ElLikeButton)` | 仅 spinner（loading 状态）；`icon` 属性传入的图标名不生效 |
| 按需 `app.use(ElLikeButton)` + `app.use(ElLikeIcon)` | 全量 solid 图标 |

原因：图标名是运行时动态值，无法按名摇树，所以 `ElLikeIcon` 的 install 一次性注册全量 fas；`ElLikeButton` 的 install 只注册自己内部用到的 spinner，保住按需体积。**按需场景下 Button 的 `icon` 属性要工作，必须同时注册 `ElLikeIcon`**（或使用方自行 `library.add` 所需图标）。

## TypeScript

包内置类型声明（`dist/es/bundle.d.ts`，由 `types` 字段与 exports 的 `types` 条件导出），无需额外安装 `@types/*`：

- `import { ElLikeButton } from 'element-like'` 获得组件类型（含 `install`），`app.use` 类型安全；
- 声明文件包含 `GlobalComponents` 增强，模板中的 `<el-like-button>` 等标签获得 Volar 的组件解析、props 提示与跳转。

## 常见问题

### 按需引入后按钮图标不显示

`ElLikeButton` 的 install 只注册 spinner（loading 用），`icon` 属性传入的图标名未注册。补注册 `ElLikeIcon`：

```ts
import { ElLikeButton, ElLikeIcon } from 'element-like'
app.use(ElLikeButton)
app.use(ElLikeIcon)
```

控制台若同时出现 `Could not find one or more icon(s)`，原因相同。

### 控制台出现 `Component "font-awesome-icon" has already been registered`

旧产物在全量注册或 Button + Icon 组合按需时，两个 install 重复注册全局图标组件触发 Vue 告警。现版本的 install 已加「先查后挂」守卫，重新 `pnpm build:lib` 或升级到最新产物即可。

### pnpm link 联调时报 `Cannot read properties of null (reading 'ce')`

软链接导致两份 Vue 副本，见上文「本地开发联调」的 `resolve.dedupe: ['vue']` 配置。

### 模板里组件名写错时没有任何报错

生产版 Vue 会静默失败，渲染成一个空壳自定义元素。排查时换开发版 Vue，或对照上文导出名/标签表检查注册范围。

## 相关文档

- 各组件用法与 API：`src/components/*/README.md`
- 打包体系、CDN 使用指南、新增组件维护约定：[packaging.md](./packaging.md)
- 组件列表与开发约定：仓库根目录 [README.md](../README.md)
