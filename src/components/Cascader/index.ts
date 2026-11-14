// 按需安装时只登记组件内部使用的图标，避免连带引入完整 solid 图标包。
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDown,
  faAngleRight,
  faCheck,
  faCircleXmark,
  faSpinner,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { withInstall } from '../withInstall'
import Cascader from './Cascader.vue'

export default /* @__PURE__ */ withInstall(Cascader, {
  setup(app) {
    library.add(faAngleDown, faAngleRight, faCheck, faCircleXmark, faSpinner, faXmark)
    if (!app.component('font-awesome-icon')) {
      app.component('font-awesome-icon', FontAwesomeIcon)
    }
  },
})
