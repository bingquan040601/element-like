// element-like 的公共类型声明：与 bundle.ts 的运行时导出逐一对应。
// 手写维护而非构建生成（如 vite-plugin-dts），公共 API 面小且稳定；
// 新增组件在 bundle.ts 登记后，须同步在此登记导出与 GlobalComponents（见 docs/packaging.md）。
// 除模块导出外，还通过 declare module 'vue' 增强 GlobalComponents，
// 让使用方模板里的 <el-like-button> 等标签获得 Volar 的组件解析与提示。
import type { App, Component } from 'vue'

// withInstall 装配后的组件形态：组件本身 + install 方法（app.use 直接可用）
export interface SFCWithInstall<T> extends Component {
  install: (app: App) => void
}

export const install: (app: App) => void

export const ElLikeIcon: SFCWithInstall<Component>
export const ElLikeButton: SFCWithInstall<Component>
export const ElLikeCard: SFCWithInstall<Component>
export const ElLikeDialog: SFCWithInstall<Component>
export const ElLikePager: SFCWithInstall<Component>
export const ElLikeCollapse: SFCWithInstall<Component>
export const ElLikeCollapseItem: SFCWithInstall<Component>
export const ElLikeTooltip: SFCWithInstall<Component>
export const ElLikeDropdown: SFCWithInstall<Component>

declare const _default: {
  install: (app: App) => void
  ElLikeIcon: typeof ElLikeIcon
  ElLikeButton: typeof ElLikeButton
  ElLikeCard: typeof ElLikeCard
  ElLikeDialog: typeof ElLikeDialog
  ElLikePager: typeof ElLikePager
  ElLikeCollapse: typeof ElLikeCollapse
  ElLikeCollapseItem: typeof ElLikeCollapseItem
  ElLikeTooltip: typeof ElLikeTooltip
  ElLikeDropdown: typeof ElLikeDropdown
}

export default _default

declare module 'vue' {
  export interface GlobalComponents {
    ElLikeIcon: typeof ElLikeIcon
    ElLikeButton: typeof ElLikeButton
    ElLikeCard: typeof ElLikeCard
    ElLikeDialog: typeof ElLikeDialog
    ElLikePager: typeof ElLikePager
    ElLikeCollapse: typeof ElLikeCollapse
    ElLikeCollapseItem: typeof ElLikeCollapseItem
    ElLikeTooltip: typeof ElLikeTooltip
    ElLikeDropdown: typeof ElLikeDropdown
  }
}
