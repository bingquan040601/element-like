<script setup lang="ts">
import router from '@/router'

// 导航项从路由配置派生（单一数据源）：
// 增删路由、修改 name/label 时导航栏自动同步，不会出现路由与导航漂移。
// 根路径重定向记录没有 name，由 flatMap 过滤掉。
const navItems = router.options.routes.flatMap((route) =>
  route.name && route.meta?.label ? [{ name: route.name, label: route.meta.label }] : [],
)
</script>

<template>
  <header class="app-header">
    <nav class="app-nav">
      <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }">
        {{ item.label }}
      </RouterLink>
    </nav>
  </header>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
/* 导航栏：还原 Element UI 水平菜单（el-menu--horizontal）的视觉与交互。
   颜色、字号、过渡时长全部消费 styles/vars.scss 的全局设计 token，
   不在组件内自定义变量。 */
.app-header {
  background-color: var(--el-color-white);
  border-bottom: 1px solid var(--el-menu-border-color);
}

.app-nav {
  display: flex;
  padding: 0 24px;
  overflow-x: auto; // 窄屏下允许横向滚动，避免导航项溢出

  a {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: var(--el-menu-item-height); // el-menu 水平模式菜单项高度
    padding: 0 20px;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
    text-decoration: none;
    border-bottom: 2px solid transparent; // 占位，避免激活时布局抖动
    box-sizing: border-box;
    transition:
      border-color var(--el-transition-duration),
      background-color var(--el-transition-duration),
      color var(--el-transition-duration);

    &:hover {
      // primary 的 light-9 档（90% 白）正是 Element 菜单的悬停浅蓝底
      background-color: var(--el-color-primary-light-9);
    }

    // router-link-active 由 vue-router 动态添加到 <a> 元素上
    &.router-link-active {
      color: var(--el-color-primary);
      border-bottom-color: var(--el-color-primary);
    }
  }
}

.app-main {
  padding: 24px;
}
</style>
