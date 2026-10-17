<template>
  <div class="el-like-card" :style="cardStyle">
    <!-- 未提供 alt 属性时按装饰图片处理，避免屏幕阅读器重复朗读摘要 -->
    <img class="el-like-card__image" :src="imgSrc" :style="imageStyle" alt="" />
    <!-- summary 优先；未传 summary 时，默认插槽可承载任意自定义内容 -->
    <div v-if="summary || $slots.default" class="el-like-card__summary">
      <template v-if="summary">{{ summary }}</template>
      <slot v-else />
    </div>
    <!-- footer 仅在传入对应插槽时渲染，避免产生空白容器 -->
    <div v-if="$slots.footer" class="el-like-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { cardProps } from './props'

defineOptions({
  name: 'ElLike-Card',
})

const props = defineProps(cardProps)

// 仅显式判断 undefined，确保 0 等合法数值不会被真假值判断忽略
const toPixel = (value: number | undefined) => (value === undefined ? undefined : `${value}px`)

const cardStyle = computed<CSSProperties>(() => ({
  width: toPixel(props.width),
}))

const imageStyle = computed<CSSProperties>(() => ({
  height: toPixel(props.imgHeight),
}))
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/card.scss，与其他组件共享全局 token 体系 */
</style>
