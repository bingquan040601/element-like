import { createApp } from 'vue'
import App from './App.vue'
// 示例应用消费库自身的公共入口（与使用方消费 dist 的 ElementLike 同一份代码）：
// app.use(ElementLike) 全量安装，模板中小写标签 <el-like-button> 直接使用，
// 与 Element Plus 的 app.use(ElementPlus) 用法对齐
import ElementLike from '@/bundle'
import router from './router'
// 全局样式（设计 token + reset）：组件样式通过 var(--el-*) 消费，必须先接入
import './styles/index.scss'

const app = createApp(App)

app.use(ElementLike)

app.use(router)

app.mount('#app')
