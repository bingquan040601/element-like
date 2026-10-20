// Collapse 组件的按需安装入口：import Collapse from '@/components/Collapse' 后
// app.use(Collapse) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Collapse from './Collapse.vue'

export default /* @__PURE__ */ withInstall(Collapse)
