// CollapseItem 组件的按需安装入口：import CollapseItem from '@/components/CollapseItem' 后
// app.use(CollapseItem) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import CollapseItem from './CollapseItem.vue'

export default /* @__PURE__ */ withInstall(CollapseItem)
