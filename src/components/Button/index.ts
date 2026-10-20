// Button 组件的按需安装入口：import Button from '@/components/Button' 后
// app.use(Button) 即可注册（install 由 withInstall 装配，含去连字符别名）。
// Button 的 loading 状态内部渲染 Icon（spinner 图标），setup 中补齐
// 全局图标组件与该图标，保证单独安装时 loading 开箱即用；
// icon 属性可传任意图标名，使用方需自行注册对应图标（如 app.use(Icon)）。
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { withInstall } from '../withInstall'
import Button from './Button.vue'

export default /* @__PURE__ */ withInstall(Button, {
  setup(app) {
    library.add(faSpinner)
    // 与 Icon 的 install 配合注册时（全量安装或按需组合），font-awesome-icon
    // 可能已挂上，重复注册会触发 Vue 告警，先查后挂
    if (!app.component('font-awesome-icon')) {
      app.component('font-awesome-icon', FontAwesomeIcon)
    }
  },
})
