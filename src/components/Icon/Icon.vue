<template>
  <i class="el-like-icon" :class="{ [`el-like-icon--${type}`]: type }" :style="{ color }">
    <!-- fontawesome 提供的官方组件，这里做二次封装：业务侧只传图标名 -->
    <font-awesome-icon v-bind="filteredProps" />
  </i>
</template>

<script setup lang="ts">
import type { FontAwesomeIconProps } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import { iconProps } from './props'

defineOptions({
  name: 'ElLike-Icon',
})

const props = defineProps(iconProps)

// 图标名固定拼接 fa-solid fa- 前缀：业务侧无需感知 fontawesome 的
// 「风格前缀 + fa- 前缀」命名规则（main.ts 只注册了 solid 图标库）
const fullIcon = computed(() => `fa-solid fa-${props.icon}`)

// 去掉 props 类型的 readonly 与必选约束，使其成为可以 delete 字段的普通对象类型
type MutablePartial<T> = { -readonly [K in keyof T]?: T[K] }

// 剔除自有 props（type/color 只作用于包装层样式；icon 的原始值不下发，
// 以拼接前缀后的 fullIcon 覆盖），其余声明过的属性原样透传——
// 之后要透传更多 fontawesome 属性时，只需在 props.ts 中声明
const filteredProps = computed((): FontAwesomeIconProps => {
  const faProps: MutablePartial<typeof props> = { ...props }
  delete faProps.icon
  delete faProps.type
  delete faProps.color
  return { ...faProps, icon: fullIcon.value }
})
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/icon.scss（全局 token 体系的一部分），此处不重复 */
</style>
