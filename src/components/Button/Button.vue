<template>
  <button
    ref="buttonRef"
    class="el-like-button"
    :class="[
      `el-like-button--${type}`,
      size && size !== 'default' ? `el-like-button--${size}` : '',
      {
        'is-plain': plain,
        'is-round': round,
        'is-circle': circle,
        'is-disabled': disabled,
        'is-loading': loading,
      },
    ]"
    type="button"
    :disabled="disabled || loading"
    :aria-busy="loading"
    @click="handleClick"
  >
    <!-- 加载中显示 spinner；否则仅在传入 icon 时显示普通图标，两者不会同时渲染 -->
    <Icon v-if="loading" class="el-like-button__icon" icon="spinner" spin aria-hidden="true" />
    <Icon v-else-if="icon" class="el-like-button__icon" :icon="icon" aria-hidden="true" />
    <!-- 没有默认插槽时不渲染内容容器，避免空容器产生额外间距 -->
    <span v-if="$slots.default" class="el-like-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
import { ref } from 'vue'
import { buttonProps } from './props'

defineOptions({
  name: 'ElLike-Button',
})

const props = defineProps(buttonProps)
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonRef = ref<HTMLButtonElement | null>(null)

// loading 与 disabled 都拦截业务点击；原生 disabled 同时阻止表单交互和焦点操作
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}

// 父组件通过组件实例的 ref 属性获取原生 button 根元素
// 例：const button = ref(); button.value?.ref?.focus()
defineExpose({
  ref: buttonRef,
})
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/button.scss，与其他组件共享全局 token 体系 */
</style>
