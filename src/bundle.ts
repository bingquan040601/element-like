// 组件库统一入口：聚合全局样式与全部组件的安装逻辑，
// 供打包配置（vite.es.config.ts / vite.umd.config.ts）作为 lib.entry 使用。
// 解决的问题：使用方无需关心「先注册 fontawesome 图标库、再逐个注册组件」
// 的初始化顺序，app.use(ElementLike) 一步完成；按需导入则从具名导出中取
// 单个组件 app.use(ElLikeButton) 单独注册（均支持去连字符别名，见 withInstall）。
// 导出命名对齐 Element Plus 约定：具名导出为 PascalCase 组件名（如 ElButton），
// 模板中使用小写连字符标签 <el-like-button>，导入名与模板标签一一对应。
import type { App } from 'vue'

// 全局样式（设计 token + reset + 全部组件样式），构建时由 Vite 抽取为 style.css
import './styles/index.scss'

// 组件均从各自目录的 index.ts 导入（已由 withInstall 装配 install 方法）
import ElLikeIcon from './components/Icon'
import ElLikeButton from './components/Button'
import ElLikeCard from './components/Card'
import ElLikeDialog from './components/Dialog'
import ElLikePager from './components/Pager'
import ElLikeCollapse from './components/Collapse'
import ElLikeCollapseItem from './components/CollapseItem'
import ElLikeTooltip from './components/Tooltip'
import ElLikeDropdown from './components/Dropdown'

// 全部组件清单（新增组件在此登记，install 与按需导出共用同一份）
const componentArr = [
  ElLikeIcon,
  ElLikeButton,
  ElLikeCard,
  ElLikeDialog,
  ElLikePager,
  ElLikeCollapse,
  ElLikeCollapseItem,
  ElLikeTooltip,
  ElLikeDropdown,
]

// app.use(ElementLike) 时的安装函数：逐个调用组件的 install。
// 注册逻辑由 withInstall 统一装配（原始名 + 去连字符别名）；Icon 的
// install 还负责 font-awesome 图标库与全局图标组件的注册。
const install = (app: App) => {
  componentArr.forEach((component) => component.install(app))
}

// 按需导出（配合构建工具 tree-shaking，只打包用到的组件；
// 每个导出组件均带 install，也可 app.use(ElLikeButton) 单独安装）
export {
  install,
  ElLikeIcon,
  ElLikeButton,
  ElLikeCard,
  ElLikeDialog,
  ElLikePager,
  ElLikeCollapse,
  ElLikeCollapseItem,
  ElLikeTooltip,
  ElLikeDropdown,
}

// 全量导出：默认导出支持 app.use(ElementLike) 全量安装，同时携带全部组件
// （对齐 Element Plus：ElementLike.ElLikeButton 也可单独安装）
export default {
  install,
  ElLikeIcon,
  ElLikeButton,
  ElLikeCard,
  ElLikeDialog,
  ElLikePager,
  ElLikeCollapse,
  ElLikeCollapseItem,
  ElLikeTooltip,
  ElLikeDropdown,
}
