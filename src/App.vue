<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UserMenu from '@/features/auth/components/UserMenu.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isBlankLayout = computed(() => route.meta.layout === 'blank')

// 登录 / 刷新后通过 /users/me 校验 token 并同步最新资料。
// 网络暂时失败时保留本地会话；401 由 HTTP 层统一清理并跳转登录页。
watch(
  () => authStore.accessToken,
  (token) => {
    if (token && !authStore.profileLoaded) {
      void authStore.fetchCurrentUser().catch(() => {})
    }
  },
  { immediate: true },
)

// 导航项从当前 Router 的路由配置派生（单一数据源）：增删带 label 的
// 路由时导航自动同步；登录页没有 label，不会进入主导航。
const navItems = router.options.routes.flatMap((item) =>
  item.name && item.meta?.label ? [{ name: item.name, label: item.meta.label }] : [],
)
</script>

<template>
  <RouterView v-if="isBlankLayout" />

  <template v-else>
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink to="/" class="app-brand">
          <span class="app-brand__logo" aria-hidden="true"></span>
          <span class="app-brand__name">Element-Like</span>
        </RouterLink>
        <nav class="app-nav" aria-label="组件导航">
          <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }">
            {{ item.label }}
          </RouterLink>
        </nav>
        <UserMenu />
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </template>
</template>

<style scoped lang="scss">
/* 导航栏：Element Plus 文档站风格——吸顶 + 毛玻璃 + 下划线生长动画。
   颜色、字号、过渡时长全部消费 styles/vars.scss 的全局设计 token，
   不在组件内自定义变量。 */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: color-mix(in srgb, var(--el-color-white) 80%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--el-menu-border-color);

  &__inner {
    display: flex;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }
}

.app-brand {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  margin-right: 32px;
  text-decoration: none;

  &__logo {
    width: 22px;
    height: 22px;
    margin-right: 10px;
    border-radius: var(--el-border-radius-base);
    background-color: var(--el-color-primary);
  }

  &__name {
    font-size: var(--el-font-size-large);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.app-nav {
  display: flex;
  flex: 1;
  min-width: 0;
  overflow-x: auto;

  a {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: var(--el-menu-item-height);
    padding: 0 20px;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
    text-decoration: none;
    transition: color var(--el-transition-duration);

    &::after {
      position: absolute;
      right: 20px;
      bottom: 0;
      left: 20px;
      height: 2px;
      background-color: var(--el-color-primary);
      content: '';
      opacity: 0;
      transform: scaleX(0);
      transition:
        opacity var(--el-transition-duration),
        transform var(--el-transition-duration);
    }

    &:hover {
      color: var(--el-color-primary);

      &::after {
        opacity: 0.3;
        transform: scaleX(1);
      }
    }

    &.router-link-active {
      color: var(--el-color-primary);

      &::after {
        opacity: 1;
        transform: scaleX(1);
      }
    }
  }
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 640px) {
  .app-header__inner {
    padding: 0 12px;
  }

  .app-brand {
    margin-right: 12px;

    &__name {
      display: none;
    }
  }

  .app-nav a {
    padding: 0 12px;
  }
}
</style>
