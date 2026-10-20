// 组件按需安装的统一装配（Element Plus 的 withInstall 模式）：
// 为组件附加 install 方法，使用方可 app.use(Button) 单独注册一个组件，
// 打包器据此 tree-shake 掉未用到的组件。
// 解决的问题：
// 1. 注册逻辑集中一处：bundle 的全量安装与单组件按需安装共用同一份，
//    避免两处逻辑漂移；
// 2. 去连字符别名兼容 CDN/DOM 模板：浏览器会把 HTML 标签全小写化，Vue 对
//    <el-like-button> 的解析候选是小写/驼峰/首字母大写三种形式，均不含连字符，
//    而组件注册名是带连字符的 ElLike-Button——追加注册 ElLikeButton 别名后
//    SFC 与 DOM 两种消费方式均能命中。
// 注意：本函数是属性赋值调用，默认会被打包器视为有副作用而无法 tree-shake。
// 各组件 index.ts 中的调用必须保留 /* @__PURE__ */ 注解（断言该调用纯，
// 组件对象只在本地创建并被 return），否则按需导入会连带打进全部组件与
// fas 图标库（可用消费测试项目的 tree-shake.js 入口验证产物体积）。
import type { App, Component } from 'vue'

// 按需安装时的扩展点：注册组件自身依赖的全局设施（如 Icon 的图标库）
type WithInstallOptions = {
  setup?: (app: App) => void
}

// 装配产物：组件本身 + 必选的 install 方法。
// 不用 vue 的 Plugin 类型是因为它是联合类型（其中一支 install 可选），
// 会导致 bundle 里 componentArr 调用 install 时报「可能为 undefined」
type SFCWithInstall<T> = T & { install: (app: App) => void }

export function withInstall<T extends { name?: string }>(
  component: T,
  options: WithInstallOptions = {},
): SFCWithInstall<T> {
  const installed = component as SFCWithInstall<T>
  installed.install = (app: App) => {
    options.setup?.(app)
    // 组件必须声明 name 才能注册；defineOptions 已声明过的组件满足该约束
    if (!component.name) return
    app.component(component.name, component as Component)
    app.component(component.name.replace(/-/g, ''), component as Component)
  }
  return installed
}
