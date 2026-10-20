<script setup lang="ts">
import { iconTypes } from '@/components/Icon/props'

// Icon 示例页：ElLike-Icon 是对 font-awesome-icon 的二次封装——
// 业务侧只传图标名（不含 fa- 前缀），组件内部固定拼接 fa-solid

// 基础用法区的图标清单：图标下方同步展示名字，方便对照与复制
const basicIcons = ['user-secret', 'mug-hot', 'paper-plane']
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
        <div v-for="name in basicIcons" :key="name" class="icon-item">
          <el-like-icon :icon="name" />
          <span class="icon-item__label">{{ name }}</span>
        </div>
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">类型 type</h2>
      <div class="icon-row">
        <div v-for="t in iconTypes" :key="t" class="icon-item">
          <el-like-icon :type="t" icon="circle-info" />
          <span class="icon-item__label">type="{{ t }}"</span>
        </div>
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">尺寸 size（透传 fontawesome）</h2>
      <div class="icon-row">
        <div class="icon-item">
          <el-like-icon icon="camera" size="lg" />
          <span class="icon-item__label">size="lg"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="camera" size="2x" />
          <span class="icon-item__label">size="2x"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="camera" size="3x" />
          <span class="icon-item__label">size="3x"</span>
        </div>
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">自定义颜色 color</h2>
      <div class="icon-row">
        <div class="icon-item">
          <el-like-icon icon="heart" color="#8e44ad" />
          <span class="icon-item__label">color="#8e44ad"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="star" color="#16a085" />
          <span class="icon-item__label">color="#16a085"</span>
        </div>
        <!-- color 是行内样式，优先级高于 type 的语义色 -->
        <div class="icon-item">
          <el-like-icon icon="bell" type="danger" color="#8e44ad" />
          <span class="icon-item__label">type="danger" color="#8e44ad"</span>
        </div>
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">旋转与翻转 rotation / flip</h2>
      <div class="icon-row">
        <div class="icon-item">
          <el-like-icon icon="arrow-up" />
          <span class="icon-item__label">arrow-up</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="arrow-up" :rotation="90" />
          <span class="icon-item__label">rotation="90"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="arrow-up" :rotation="180" />
          <span class="icon-item__label">rotation="180"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="arrow-up" :rotation="270" />
          <span class="icon-item__label">rotation="270"</span>
        </div>
        <!-- 翻转选上下/左右都不对称的图标，效果才明显 -->
        <div class="icon-item">
          <el-like-icon icon="arrow-trend-up" flip="horizontal" />
          <span class="icon-item__label">flip="horizontal"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="arrow-trend-up" flip="vertical" />
          <span class="icon-item__label">flip="vertical"</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="arrow-trend-up" flip="both" />
          <span class="icon-item__label">flip="both"</span>
        </div>
      </div>
    </section>

    <section class="icon-section">
      <h2 class="icon-section__title">动画（keyframes 由 fontawesome 注入的 CSS 提供）</h2>
      <div class="icon-row">
        <div class="icon-item">
          <el-like-icon icon="spinner" spin />
          <span class="icon-item__label">spin</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="circle-notch" spin-pulse />
          <span class="icon-item__label">spin-pulse</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="gear" spin-reverse />
          <span class="icon-item__label">spin-reverse</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="heart" beat />
          <span class="icon-item__label">beat</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="bell" shake />
          <span class="icon-item__label">shake</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="star" bounce />
          <span class="icon-item__label">bounce</span>
        </div>
        <div class="icon-item">
          <el-like-icon icon="circle-info" fade />
          <span class="icon-item__label">fade</span>
        </div>
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
  flex-wrap: wrap; // 标注加长后允许换行，避免窄屏溢出
  align-items: center;
  gap: 16px;
  // 图标默认 1em，放大字号便于展示
  font-size: 24px;
}

// 「图标 + 标注」的纵向组合：标注不受 .icon-row 放大字号的影响
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &__label {
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--el-text-color-secondary);
  }
}
</style>
