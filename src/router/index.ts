import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, RouterHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 扩展路由 meta 类型：导航、页面标题、鉴权与布局均通过统一配置消费。
declare module 'vue-router' {
  interface RouteMeta {
    /** 主导航显示名；未配置的路由不会出现在导航栏。 */
    label?: string
    /** 独立页面标题；优先于 label。 */
    title?: string
    /** 是否允许未登录访问，默认 false（新增路由默认受保护）。 */
    public?: boolean
    /** blank 不渲染主导航和默认内容容器。 */
    layout?: 'blank'
  }
}

export const routes: RouteRecordRaw[] = [
  // 登录和注册是公开页面；独立布局不展示主导航。
  {
    path: '/login',
    name: 'login',
    meta: { title: '登录', public: true, layout: 'blank' },
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/register',
    name: 'register',
    meta: { title: '注册', public: true, layout: 'blank' },
    component: () => import('@/views/RegisterView.vue'),
  },
  // 根路径重定向到第一个组件示例页，避免打开 / 时一片空白。
  { path: '/', redirect: '/icon' },
  // 各组件示例页：动态导入实现路由级代码分割，按需加载。
  {
    path: '/icon',
    name: 'icon',
    meta: { label: 'Icon' },
    component: () => import('@/views/IconView.vue'),
  },
  {
    path: '/button',
    name: 'button',
    meta: { label: 'Button' },
    component: () => import('@/views/ButtonView.vue'),
  },
  {
    path: '/card',
    name: 'card',
    meta: { label: 'Card' },
    component: () => import('@/views/CardView.vue'),
  },
  {
    path: '/dialog',
    name: 'dialog',
    meta: { label: 'Dialog' },
    component: () => import('@/views/DialogView.vue'),
  },
  {
    path: '/pager',
    name: 'pager',
    meta: { label: 'Pager' },
    component: () => import('@/views/PagerView.vue'),
  },
  // 兼容早期占位页的拼写错误路由。
  { path: '/parger', redirect: '/pager' },
  {
    path: '/collapse',
    name: 'collapse',
    meta: { label: 'Collapse' },
    component: () => import('@/views/CollapseView.vue'),
  },
  {
    path: '/tooltip',
    name: 'tooltip',
    meta: { label: 'Tooltip' },
    component: () => import('@/views/TooltipView.vue'),
  },
  {
    path: '/dropdown',
    name: 'dropdown',
    meta: { label: 'Dropdown' },
    component: () => import('@/views/DropdownView.vue'),
  },
  {
    path: '/virtual-list',
    name: 'virtual-list',
    meta: { label: 'VirtualList' },
    component: () => import('@/views/VirtualListView.vue'),
  },
  {
    path: '/cascader',
    name: 'cascader',
    meta: { label: 'Cascader' },
    component: () => import('@/views/CascaderView.vue'),
  },
  {
    path: '/color',
    name: 'color',
    meta: { label: 'Color' },
    component: () => import('@/views/ColorView.vue'),
  },
]

/** 工厂函数便于测试使用 memory history，也避免多个 Router 实例共享守卫配置。 */
export const createAppRouter = (
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) => {
  const router = createRouter({ history, routes })
  router.beforeEach((to) => {
    // 延迟到导航时获取 Store：默认 Router 创建时 main.ts 尚未安装 Pinia。
    const authStore = useAuthStore()
    if (authStore.accessToken && !authStore.isAuthenticated) authStore.clearSession()

    if (to.meta.public) {
      // 已登录用户不再停留在登录 / 注册页。
      return (to.name === 'login' || to.name === 'register') && authStore.isAuthenticated
        ? { name: 'icon' }
        : true
    }
    if (authStore.isAuthenticated) return true

    // 保留完整站内目标地址，登录成功后由登录页安全地恢复。
    return { name: 'login', query: { redirect: to.fullPath } }
  })

  router.afterEach((to) => {
    const pageTitle = to.meta.title ?? to.meta.label
    document.title = pageTitle ? `${pageTitle} - element-like` : 'element-like'
  })

  return router
}

const router = createAppRouter()

export default router
