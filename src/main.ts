import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createApp } from 'vue'
import App from './App.vue'
import Icon from '@/components/Icon/Icon.vue'
import router from './router'
// 全局样式（设计 token + reset）：组件样式通过 var(--el-*) 消费，必须先接入
import './styles/index.scss'

const app = createApp(App)

// font-awesome：全量注册 solid 图标库，并挂载全局图标组件
library.add(fas)
app.component('font-awesome-icon', FontAwesomeIcon)

// 组件库组件全局注册（与 Element Plus 的 app.use 消费方式对齐）
app.component('ElLike-Icon', Icon)

app.use(router)

app.mount('#app')
