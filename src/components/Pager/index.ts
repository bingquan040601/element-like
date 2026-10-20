// Pager 组件的按需安装入口：import Pager from '@/components/Pager' 后
// app.use(Pager) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Pager from './Pager.vue'

export default /* @__PURE__ */ withInstall(Pager)
