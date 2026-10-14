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
   变量命名对齐 Element Plus 的 CSS 变量，后续组件复用时可抽到全局 SCSS 文件。 */
$el-color-primary: #409eff;
$el-text-color-primary: #303133;
$el-menu-border-color: #e6e6e6;
$el-menu-hover-bg-color: #ecf5ff;
$el-menu-item-height: 60px;

.app-header {
  background-color: #fff;
  border-bottom: 1px solid $el-menu-border-color;
}

.app-nav {
  display: flex;
  padding: 0 24px;
  overflow-x: auto; // 窄屏下允许横向滚动，避免导航项溢出

  a {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: $el-menu-item-height; // el-menu 水平模式菜单项高度
    padding: 0 20px;
    font-size: 14px;
    color: $el-text-color-primary;
    text-decoration: none;
    border-bottom: 2px solid transparent; // 占位，避免激活时布局抖动
    box-sizing: border-box;
    transition:
      border-color 0.3s,
      background-color 0.3s,
      color 0.3s;

    &:hover {
      background-color: $el-menu-hover-bg-color;
    }

    // router-link-active 由 vue-router 动态添加到 <a> 元素上
    &.router-link-active {
      color: $el-color-primary;
      border-bottom-color: $el-color-primary;
    }
  }
}

.app-main {
  padding: 24px;
}
</style>
