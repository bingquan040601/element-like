import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 全局样式（设计 token + reset）：组件样式通过 var(--el-*) 消费，必须先接入
import './styles/index.scss'

const app = createApp(App)

app.use(router)

app.mount('#app')
