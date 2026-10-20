// Tooltip 组件的按需安装入口：import Tooltip from '@/components/Tooltip' 后
// app.use(Tooltip) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Tooltip from './Tooltip.vue'

export default /* @__PURE__ */ withInstall(Tooltip)
