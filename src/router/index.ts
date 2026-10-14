import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 根路径重定向到第一个组件示例页，避免打开 / 时一片空白
    { path: '/', redirect: '/icon' },
    // 各组件示例页：动态导入实现路由级代码分割，按需加载
    {
      path: '/icon',
      name: 'icon',
      component: () => import('@/views/IconView.vue'),
    },
    {
      path: '/button',
      name: 'button',
      component: () => import('@/views/ButtonView.vue'),
    },
    {
      path: '/card',
      name: 'card',
      component: () => import('@/views/CardView.vue'),
    },
    {
      path: '/dialog',
      name: 'dialog',
      component: () => import('@/views/DialogView.vue'),
    },
    {
      path: '/parger',
      name: 'parger',
      component: () => import('@/views/PargerView.vue'),
    },
    {
      path: '/collapse',
      name: 'collapse',
      component: () => import('@/views/CollapseView.vue'),
    },
    {
      path: '/tooltip',
      name: 'tooltip',
      component: () => import('@/views/TooltipView.vue'),
    },
    {
      path: '/dropdown',
      name: 'dropdown',
      component: () => import('@/views/DropdownView.vue'),
    },
  ],
})

export default router
