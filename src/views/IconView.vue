<script setup lang="ts">
import { iconTypes } from '@/components/Icon/props'

// Icon 示例页：ElLike-Icon 是对 font-awesome-icon 的二次封装——
// 业务侧只传图标名（不含 fa- 前缀），组件内部固定拼接 fa-solid
</script>

<template>
  <div class="icon-page">
    <h1>图标 Icon</h1>
    <p class="icon-page__intro">
      对 font-awesome-icon 的二次封装：只需传入图标名（如 user-secret），组件内部固定拼接 fa-solid
      前缀。type 提供语义色；size、rotation、flip 与动画开关（spin、beat 等）透传给
      fontawesome；color 可自定义颜色（优先级高于 type）。
    </p>

    <section class="icon-section">
      <h2 class="icon-section__title">基础用法</h2>
      <div class="icon-row">
        <ElLike-Icon icon="user-secret" />
        <ElLike-Icon icon="mug-hot" />
        <ElLike-Icon icon="paper-plane" />
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">类型 type</h2>
      <div class="icon-row">
        <ElLike-Icon v-for="t in iconTypes" :key="t" :type="t" icon="circle-info" />
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">尺寸 size（透传 fontawesome）</h2>
      <div class="icon-row">
        <ElLike-Icon icon="camera" size="lg" />
        <ElLike-Icon icon="camera" size="2x" />
        <ElLike-Icon icon="camera" size="3x" />
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">自定义颜色 color</h2>
      <div class="icon-row">
        <ElLike-Icon icon="heart" color="#8e44ad" />
        <ElLike-Icon icon="star" color="#16a085" />
        <!-- color 是行内样式，优先级高于 type 的语义色 -->
        <ElLike-Icon icon="bell" type="danger" color="#8e44ad" />
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">旋转与翻转 rotation / flip</h2>
      <div class="icon-row">
        <ElLike-Icon icon="arrow-up" />
        <ElLike-Icon icon="arrow-up" :rotation="90" />
        <ElLike-Icon icon="arrow-up" :rotation="180" />
        <ElLike-Icon icon="arrow-up" :rotation="270" />
        <!-- 翻转选上下/左右都不对称的图标，效果才明显 -->
        <ElLike-Icon icon="arrow-trend-up" flip="horizontal" />
        <ElLike-Icon icon="arrow-trend-up" flip="vertical" />
        <ElLike-Icon icon="arrow-trend-up" flip="both" />
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">动画（keyframes 由 fontawesome 注入的 CSS 提供）</h2>
      <div class="icon-row">
        <ElLike-Icon icon="spinner" spin />
        <ElLike-Icon icon="circle-notch" spin-pulse />
        <ElLike-Icon icon="gear" spin-reverse />
        <ElLike-Icon icon="heart" beat />
        <ElLike-Icon icon="bell" shake />
        <ElLike-Icon icon="star" bounce />
        <ElLike-Icon icon="circle-info" fade />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.icon-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.icon-section {
  margin-top: 32px;

  &__title {
    margin-bottom: 16px;
  }
}

.icon-row {
  display: flex;
  align-items: center;
  gap: 16px;
  // 图标默认 1em，放大字号便于展示
  font-size: 24px;
}
</style>
