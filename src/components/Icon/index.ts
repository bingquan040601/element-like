// Icon 组件的按需安装入口：除组件本身外，还注册其依赖的 font-awesome
// 图标库与全局图标组件——app.use(Icon) 开箱即用。
// 注意：library.add 放在 install 内而非模块顶层，这样未使用 Icon 的
// 按需导入可以真正 tree-shake 掉整个 fas 图标库。
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { withInstall } from '../withInstall'
import Icon from './Icon.vue'

export default /* @__PURE__ */ withInstall(Icon, {
  setup(app) {
    library.add(fas)
    // 与 Button 等组件的 install 配合按需注册时，font-awesome-icon 可能
    // 已由先注册的组件挂上，重复注册会触发 Vue 告警，先查后挂
    if (!app.component('font-awesome-icon')) {
      app.component('font-awesome-icon', FontAwesomeIcon)
    }
  },
})
