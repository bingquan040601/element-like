<template>
  <Tooltip
    ref="tooltipRef"
    :content="props.content"
    :trigger="props.trigger"
    :placement="props.placement"
    :manual="props.manual"
    :open-delay="props.openDelay"
    :close-delay="props.closeDelay"
    :visible="props.visible"
    :popper-class="mergedPopperClass"
    @visible-change="onVisibleChange"
    @update:visible="onUpdateVisible"
  >
    <slot />
    <template #content>
      <ul class="el-like-dropdown-menu" role="menu">
        <li
          v-for="(option, index) in props.menuOptions"
          :key="index"
          class="el-like-dropdown-menu__item"
          :class="{ 'is-divided': option.divided }"
        >
          <button
            type="button"
            class="el-like-dropdown-menu__action"
            role="menuitem"
            :disabled="option.disabled"
            @click="handleSelect(option)"
          >
            <Icon
              v-if="option.icon"
              :icon="option.icon"
              class="el-like-dropdown-menu__icon"
              aria-hidden="true"
            />
            <span class="el-like-dropdown-menu__label">{{ option.label }}</span>
          </button>
        </li>
      </ul>
    </template>
  </Tooltip>
</template>

<script setup lang="ts">
import Icon from '@/components/Icon/Icon.vue'
import Tooltip from '@/components/Tooltip/Tooltip.vue'
import { computed, useTemplateRef } from 'vue'
import type { DropdownMenuOption } from './props'
import { dropdownProps } from './props'

defineOptions({
  name: 'ElLike-Dropdown',
})

const props = defineProps(dropdownProps)
const emit = defineEmits<{
  'visible-change': [visible: boolean]
  'update:visible': [visible: boolean]
  select: [option: DropdownMenuOption]
}>()

// 与 Tooltip 的 defineExpose 签名保持一致，便于通过模板 ref 调用 open / close / toggle
interface TooltipInstance {
  open: () => void
  close: () => void
  toggle: () => void
}

const tooltipRef = useTemplateRef<TooltipInstance>('tooltipRef')

// 内部类名固定附加在气泡根元素上（dropdown.scss 依赖它覆盖 Tooltip 的深色气泡视觉），
// 用户传入的 popperClass 合并追加，允许继续自定义
const mergedPopperClass = computed(() =>
  ['el-like-dropdown', props.popperClass].filter(Boolean).join(' '),
)

// Tooltip 的两个事件原样上抛：visible-change 对外暴露显示状态，
// update:visible 让继承来的 visible 属性支持 v-model:visible
const onVisibleChange = (visible: boolean) => {
  emit('visible-change', visible)
}

const onUpdateVisible = (visible: boolean) => {
  emit('update:visible', visible)
}

// 点击条目：禁用条目直接忽略（原生 disabled 已拦截点击，这里双保险）；
// 先上抛 select，hideAfterClick 为 true 时再关闭下拉
const handleSelect = (option: DropdownMenuOption) => {
  if (option.disabled) return
  emit('select', option)
  if (props.hideAfterClick) {
    tooltipRef.value?.close()
  }
}
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/dropdown.scss，与其他组件共享全局 token 体系 */
</style>
