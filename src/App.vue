<script setup lang="ts">
// 组件示例导航：name 与路由配置一一对应
const navItems = [
  { name: 'icon', label: 'Icon' },
  { name: 'button', label: 'Button' },
  { name: 'card', label: 'Card' },
  { name: 'dialog', label: 'Dialog' },
  { name: 'parger', label: 'Parger' },
  { name: 'collapse', label: 'Collapse' },
  { name: 'tooltip', label: 'Tooltip' },
  { name: 'dropdown', label: 'Dropdown' },
] as const
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
