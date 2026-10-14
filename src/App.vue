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

<style scoped>
.app-header {
  border-bottom: 1px solid #e4e7ed;
}

.app-nav {
  display: flex;
  gap: 16px;
  padding: 12px 24px;
}

.app-nav a {
  color: #606266;
  text-decoration: none;
}

.app-nav a.router-link-active {
  color: #409eff;
  font-weight: 600;
}

.app-main {
  padding: 24px;
}
</style>
