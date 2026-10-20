<template>
  <div class="el-like-collapse-item" :class="{ 'is-active': isActive, 'is-disabled': disabled }">
    <button
      class="el-like-collapse-item__header"
      :class="{ 'is-active': isActive }"
      type="button"
      :disabled="disabled"
      :aria-expanded="isActive"
      :aria-controls="contentId"
      @click="handleHeaderClick"
    >
      <slot name="title">
        <span class="el-like-collapse-item__title">{{ title || name }}</span>
      </slot>
      <span
        class="el-like-collapse-item__arrow"
        :class="{ 'is-active': isActive }"
        aria-hidden="true"
      ></span>
    </button>
    <Transition @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @leave="leave">
      <div v-show="isActive" :id="contentId" class="el-like-collapse-item__wrap">
        <div class="el-like-collapse-item__content">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { collapseContextKey, collapseItemProps } from './props'

defineOptions({
  name: 'ElLike-CollapseItem',
})

const props = defineProps(collapseItemProps)

// 独立使用（不在 Collapse 内）时优雅降级：永远收起、点击不生效
const collapse = inject(collapseContextKey)

const isActive = computed(() => collapse?.activeNames.value.includes(props.name) ?? false)
const contentId = useId()

const handleHeaderClick = () => {
  if (props.disabled) return
  collapse?.handleItemClick(props.name)
}

// 展开/收起高度过渡：进入时从 0 过渡到内容实际高度，展开完成后还原为自动高度。
// Transition 的 JS 钩子只负责内联 height，display 由 v-show 控制，
// 收起后内容移出无障碍树、内部焦点元素不可达。
const nextFrame = (callback: () => void) => {
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(callback)
  else callback()
}

const beforeEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
}

const enter = (el: Element) => {
  const element = el as HTMLElement
  // 强制回流提交当前高度，再在下一帧过渡到内容高度：
  // 否则同一帧内连续写入会被合并，高度瞬间跳变、过渡不生效
  void element.offsetHeight
  nextFrame(() => {
    element.style.height = `${element.scrollHeight}px`
  })
}

const afterEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = ''
}

const leave = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = `${element.scrollHeight}px`
  // 同上：先提交内容高度，下一帧再降到 0，让 height 过渡真正运行
  void element.offsetHeight
  nextFrame(() => {
    element.style.height = '0'
  })
}
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/collapse.scss，与其他组件共享全局 token 体系 */
</style>
