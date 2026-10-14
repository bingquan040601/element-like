<script setup lang="ts">
import {
  neutralGroups,
  neutralSwatches,
  semanticColors,
  semanticSwatches,
  type Swatch,
} from '@/styles/tokens'
import { onMounted, onUnmounted, ref } from 'vue'

// 色彩展示页（参考 Element Plus 色彩页）。
// 本组件不复制任何色值：色块背景引用 var(--el-*)，色值在运行时读取——
// 调整 vars.scss 后本页自动跟随。token 目录投影在 styles/tokens.ts，
// 由防漂移测试（styles/__tests__/tokens.spec.ts）保障与 vars.scss 同步。

// 页面布局结构：SwatchRow/SwatchSection 描述「分区-行-卡片」三层，Swatch 在 tokens.ts
interface SwatchRow {
  /** 行标题：辅助色为色名、中性色为分组名，主色行无标题 */
  title?: string
  /** 中性色使用紧凑布局 */
  compact?: boolean
  swatches: Swatch[]
}

interface SwatchSection {
  title: string
  rows: SwatchRow[]
}

const sections: SwatchSection[] = [
  {
    title: '主色 Primary',
    rows: semanticColors
      .filter((color) => color.isPrimary)
      .map((color) => ({ swatches: semanticSwatches(color.name) })),
  },
  {
    title: '辅助色 Auxiliary',
    rows: semanticColors
      .filter((color) => !color.isPrimary)
      .map((color) => ({ title: color.label, swatches: semanticSwatches(color.name) })),
  },
  {
    title: '中性色 Neutral',
    rows: neutralGroups.map((group) => ({
      title: group.title,
      compact: true,
      swatches: neutralSwatches(group),
    })),
  },
]

// 色值缓存：挂载后从 DOM 读取真实生效的颜色，保证展示与运行时主题一致。
// hex 用于展示（与 vars.scss 书写格式一致），rgb 用于点击复制（计算样式原始格式）
interface ColorValue {
  rgb: string
  hex: string
}

const colorValues = ref<Record<string, ColorValue>>({})
const pageEl = ref<HTMLElement | null>(null)

onMounted(() => {
  pageEl.value?.querySelectorAll<HTMLElement>('[data-color-var]').forEach((el) => {
    const varName = el.dataset.colorVar
    if (!varName) return
    const styles = getComputedStyle(el)
    // 防漂移自检：token 未定义时 getPropertyValue 返回空串。
    // 开发期即时告警，CI 的最终保障在 styles/__tests__/tokens.spec.ts
    if (!styles.getPropertyValue(varName)) {
      console.warn(`[ColorView] 未定义的设计 token：${varName}，请检查 styles/vars.scss`)
    }
    const rgb = styles.backgroundColor
    colorValues.value[varName] = { rgb, hex: rgbToHex(rgb) }
  })
})

// 点击色卡复制 rgb 值，顶部弹出轻提示，2 秒后自动消失
const copiedText = ref('')
let copyTimer: number | undefined

async function copyColor(varName: string) {
  const value = colorValues.value[varName]
  if (!value) return
  try {
    await navigator.clipboard.writeText(value.rgb)
    copiedText.value = `已复制 ${value.rgb}`
  } catch {
    copiedText.value = '复制失败，请检查浏览器剪贴板权限'
  }
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => (copiedText.value = ''), 2000)
}

onUnmounted(() => window.clearTimeout(copyTimer))

// 将计算样式返回的 rgb() 转为 hex 展示，与 vars.scss 中的书写格式一致
function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgb
  const [, r, g, b] = match
  if (!r || !g || !b) return rgb
  return `#${[r, g, b].map((n) => Number(n).toString(16).padStart(2, '0')).join('')}`
}
</script>

<template>
  <div ref="pageEl" class="color-page">
    <h1>色彩 Color</h1>
    <p class="color-page__intro">
      本页色板直接消费 styles/vars.scss 的设计
      token，色值在运行时读取——调整主题后自动跟随。点击色卡可复制其 rgb 值。
    </p>

    <section v-for="section in sections" :key="section.title" class="color-section">
      <h2 class="color-section__title">{{ section.title }}</h2>

      <div v-for="row in section.rows" :key="row.title ?? section.title" class="color-row">
        <div v-if="row.title" class="color-row__label">{{ row.title }}</div>

        <div
          v-for="swatch in row.swatches"
          :key="swatch.varName"
          class="color-card"
          :class="{ 'color-card--compact': row.compact }"
          :title="`点击复制 ${swatch.varName}`"
          @click="copyColor(swatch.varName)"
        >
          <div
            class="color-card__area"
            :data-color-var="swatch.varName"
            :style="{ backgroundColor: `var(${swatch.varName})` }"
          ></div>
          <div class="color-card__meta">
            <div class="color-card__label">{{ swatch.label }}</div>
            <div class="color-card__value">{{ colorValues[swatch.varName]?.hex ?? '' }}</div>
          </div>
        </div>
      </div>
    </section>

    <transition name="color-toast-fade">
      <div v-if="copiedText" class="color-toast">{{ copiedText }}</div>
    </transition>
  </div>
</template>

<style scoped lang="scss">
.color-page__intro {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}

.color-section {
  margin-top: 32px;

  &__title {
    margin-bottom: 16px;
  }
}

.color-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  &__label {
    flex: 0 0 72px;
    display: flex;
    align-items: center;
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
  }
}

.color-card {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--el-border-radius-base);
  background-color: var(--el-color-white);
  cursor: pointer;
  transition: border-color var(--el-transition-duration-fast);

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__area {
    height: 64px;
  }

  &__meta {
    padding: 8px;
  }

  &__label {
    font-size: var(--el-font-size-base);
    color: var(--el-text-color-primary);
  }

  &__value {
    margin-top: 2px;
    font-size: var(--el-font-size-extra-small);
    color: var(--el-text-color-secondary);
  }

  &--compact {
    .color-card__area {
      height: 32px;
    }

    .color-card__meta {
      padding: 4px 8px;
    }
  }
}

// 复制提示：固定顶部居中，2 秒后自动消失
.color-toast {
  position: fixed;
  top: 72px; // 避开 60px 高的导航栏
  left: 50%;
  z-index: 2000;
  transform: translateX(-50%);
  padding: 10px 16px;
  border-radius: var(--el-border-radius-base);
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--el-color-white);
  font-size: var(--el-font-size-base);
}

.color-toast-fade-enter-active,
.color-toast-fade-leave-active {
  transition: opacity var(--el-transition-duration-fast);
}

.color-toast-fade-enter-from,
.color-toast-fade-leave-to {
  opacity: 0;
}
</style>
