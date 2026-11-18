import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import ElementLike from '@/bundle'
import { configureHttpClient } from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import router from './router'
import './styles/index.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(ElementLike)
app.use(pinia)
app.use(router)

const authStore = useAuthStore(pinia)
configureHttpClient({
  getAccessToken: () => authStore.accessToken,
  onUnauthorized: (accessToken) => {
    // 旧请求晚于退出 / 重新登录返回时，不影响当前会话。
    if (accessToken !== authStore.accessToken) return
    authStore.clearSession()
    const currentRoute = router.currentRoute.value
    if (currentRoute.name === 'login') return
    void router.replace({
      name: 'login',
      query: { redirect: currentRoute.fullPath },
    })
  },
})

app.mount('#app')
