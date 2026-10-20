// Dropdown 组件的按需安装入口：import Dropdown from '@/components/Dropdown' 后
// app.use(Dropdown) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Dropdown from './Dropdown.vue'

export default /* @__PURE__ */ withInstall(Dropdown)
