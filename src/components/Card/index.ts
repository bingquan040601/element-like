// Card 组件的按需安装入口：import Card from '@/components/Card' 后
// app.use(Card) 即可注册（install 由 withInstall 装配，含去连字符别名）
import { withInstall } from '../withInstall'
import Card from './Card.vue'

export default /* @__PURE__ */ withInstall(Card)
