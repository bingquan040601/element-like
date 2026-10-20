<template>
  <div class="el-like-collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref, watch } from 'vue'
import { collapseContextKey, collapseProps } from './props'

defineOptions({
  name: 'ElLike-Collapse',
})

const props = defineProps(collapseProps)
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  change: [value: string[]]
}>()

// 内部维护展开项副本：v-model 遵循不可变更新约定，
// 不直接对父组件传入的 modelValue 数组做 push/splice。
const activeNames = ref<string[]>([...props.modelValue])

// modelValue 由外部变化（如父组件重置）时同步内部状态
watch(
  () => props.modelValue,
  (value) => {
    activeNames.value = [...value]
  },
)

const handleItemClick = (name: string) => {
  if (props.accordion) {
    // 手风琴模式：最多展开一项，点击已展开项时收起全部
    activeNames.value = activeNames.value[0] === name ? [] : [name]
  } else {
    const index = activeNames.value.indexOf(name)
    if (index > -1) {
      activeNames.value.splice(index, 1)
    } else {
      activeNames.value.push(name)
    }
  }

  const nextNames = [...activeNames.value]
  emit('update:modelValue', nextNames)
  emit('change', nextNames)
}

provide(collapseContextKey, {
  activeNames,
  handleItemClick,
})
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/collapse.scss，与其他组件共享全局 token 体系 */
</style>
