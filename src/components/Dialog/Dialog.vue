<template>
  <Teleport to="body">
    <Transition name="el-like-dialog-fade">
      <div v-if="visible" class="el-like-dialog__overlay" @click.self="handleOverlayClick">
        <div
          class="el-like-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :style="dialogStyle"
        >
          <div class="el-like-dialog__header">
            <h2 :id="titleId" class="el-like-dialog__title">
              <slot name="title">{{ title }}</slot>
            </h2>
            <button
              class="el-like-dialog__close"
              type="button"
              aria-label="关闭对话框"
              @click="handleClose"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div v-if="$slots.default" class="el-like-dialog__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="el-like-dialog__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, useId, watch } from 'vue'
import { dialogProps } from './props'

defineOptions({
  name: 'ElLike-Dialog',
})

const props = defineProps(dialogProps)
const emit = defineEmits<{
  close: []
}>()

const titleId = useId()

const dialogStyle = computed<CSSProperties>(() => ({
  width: props.width,
  marginTop: props.top,
}))

const handleClose = () => {
  emit('close')
}

const handleOverlayClick = () => {
  if (!props.closeOnClickModal) return
  handleClose()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && !event.defaultPrevented) handleClose()
}

const removeKeydownListener = () => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeydown)
  }
}

// 仅在显示期间监听 Esc，隐藏和卸载时均移除监听，避免无效回调
watch(
  () => props.visible,
  (visible) => {
    if (typeof document === 'undefined') return
    removeKeydownListener()
    if (visible) document.addEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(removeKeydownListener)
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/dialog.scss，与其他组件共享全局 token 体系 */
</style>
