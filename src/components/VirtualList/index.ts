// VirtualList 的按需安装入口，同时导出滚动控制与范围事件相关类型
import { withInstall } from '../withInstall'
import VirtualList from './VirtualList.vue'

export default /* @__PURE__ */ withInstall(VirtualList)
export type { ScrollAlign, VirtualListExpose, VirtualListKey, VirtualListRange } from './types'
export { Virtualizer } from './virtualizer'
