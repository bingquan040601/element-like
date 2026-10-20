// Dialog 组件的按需安装入口：import Dialog from '@/components/Dialog' 后
// app.use(Dialog) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Dialog from './Dialog.vue'

export default /* @__PURE__ */ withInstall(Dialog)
