import { createRouter, createWebHistory } from 'vue-router'

// 扩展路由 meta 类型：导航等消费方可以类型安全地读取 label，
// 避免直接写 Record<string, unknown> 或断言
declare module 'vue-router' {
  interface RouteMeta {
    /** 导航栏显示名，由 App.vue 的导航派生逻辑读取 */
    label?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径重定向到第一个组件示例页，避免打开 / 时一片空白
    { path: '/', redirect: '/icon' },
    // 各组件示例页：动态导入实现路由级代码分割，按需加载。
    // meta.label 与 name/path 同处一处，是导航栏的唯一数据源——
    // 增删路由或改名时 App.vue 的导航自动同步，无需手工维护第二份列表。
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
      path: '/parger',
      name: 'parger',
      meta: { label: 'Parger' },
      component: () => import('@/views/PargerView.vue'),
    },
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
      path: '/color',
      name: 'color',
      meta: { label: 'Color' },
      component: () => import('@/views/ColorView.vue'),
    },
  ],
})

// 路由切换后同步浏览器标签标题：复用 meta.label 单一数据源，
// 无需在导航栏之外再维护一份标题映射。
// 重定向等无 label 的路由回退到站点名。
router.afterEach((to) => {
  document.title = to.meta.label ? `${to.meta.label} - element-like` : 'element-like'
})

export default router
