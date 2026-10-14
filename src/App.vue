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
    <div class="app-header__inner">
      <RouterLink to="/" class="app-brand">
        <span class="app-brand__logo" aria-hidden="true"></span>
        <span class="app-brand__name">Element-Like</span>
      </RouterLink>
      <nav class="app-nav">
        <RouterLink v-for="item in navItems" :key="item.name" :to="{ name: item.name }">
          {{ item.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
/* 导航栏：Element Plus 文档站风格——吸顶 + 毛玻璃 + 下划线生长动画。
   颜色、字号、过渡时长全部消费 styles/vars.scss 的全局设计 token，
   不在组件内自定义变量。 */
.app-header {
  position: sticky; // 吸顶：滚动时导航浮在内容之上
  top: 0;
  z-index: 100;
  // 半透明白 + 背景模糊：滚动时下方内容透入并虚化，营造悬浮感
  background-color: color-mix(in srgb, var(--el-color-white) 80%, transparent);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--el-menu-border-color);

  &__inner {
    display: flex;
    align-items: center;
    max-width: 1200px; // 与内容区同一容器宽度，宽屏下两端对齐
    margin: 0 auto;
    padding: 0 24px;
  }
}

// 品牌区：主色方块 + 站点名，建立产品身份锚点
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
  overflow-x: auto; // 窄屏下允许横向滚动，避免导航项溢出

  a {
    position: relative; // 承载 ::after 下划线
    display: flex;
    flex-shrink: 0;
    align-items: center;
    height: var(--el-menu-item-height); // el-menu 水平模式菜单项高度
    padding: 0 20px;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
    text-decoration: none;
    transition: color var(--el-transition-duration);

    // 下划线用 ::after 绝对定位绘制，不占布局（无需占位边框防抖动）；
    // 默认 scaleX(0) 收起，悬停/激活时生长展开，切换路由有滑动过渡
    &::after {
      position: absolute;
      right: 20px; // 与 padding 同宽，下划线正好兜住文字
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
        opacity: 0.3; // 悬停先给一条浅色下划线预览
        transform: scaleX(1);
      }
    }

    // router-link-active 由 vue-router 动态添加到 <a> 元素上
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
  max-width: 1200px; // 与导航同一容器，宽屏下内容居中对齐
  margin: 0 auto;
  padding: 24px;
}
</style>
