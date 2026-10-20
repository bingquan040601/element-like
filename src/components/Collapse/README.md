# Collapse 折叠面板

Collapse 通过 v-model 维护展开面板集合，支持手风琴模式、自定义标题与禁用面板，展开/收起带高度过渡动画。

- `Collapse` 与 `CollapseItem` 已全局注册，模板中直接使用 `<el-like-collapse>` 与 `<el-like-collapse-item>`，无需 import
- 每个 `CollapseItem` 必须有唯一的 `name`，`modelValue` 中存放当前展开面板的 name 数组
- `accordion` 开启手风琴模式，同一时间最多展开一个面板
- `title` 缺省时回退展示 `name`

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const activeNames = ref<string[]>(['1'])
</script>

<template>
  <el-like-collapse v-model="activeNames">
    <el-like-collapse-item name="1" title="一致性 Consistency">
      <p>与现实生活流程、逻辑保持一致，遵循用户习惯的语言和概念。</p>
    </el-like-collapse-item>
    <el-like-collapse-item name="2" title="反馈 Feedback">
      <p>通过界面样式和交互动效让用户清晰地感知自己的操作。</p>
    </el-like-collapse-item>
  </el-like-collapse>
</template>
```

点击面板头部切换展开状态，可同时展开多个面板；每次变化都会通过 `change` 事件抛出最新的展开 name 数组。

## 手风琴模式

设置 `accordion` 后同时最多展开一个面板，展开新面板会自动收起其他面板；再次点击已展开面板会将其全部收起：

```vue
<el-like-collapse v-model="activeNames" accordion>
  <el-like-collapse-item name="1" title="一致性 Consistency">…</el-like-collapse-item>
  <el-like-collapse-item name="2" title="反馈 Feedback">…</el-like-collapse-item>
</el-like-collapse>
```

## 自定义标题

通过 `title` 插槽替换标题内容；不传 `title` 时标题回退展示 `name`：

```vue
<el-like-collapse v-model="activeNames">
  <el-like-collapse-item name="custom">
    <template #title>
      <b>自定义标题</b>
    </template>
    <p>通过 title 插槽自定义标题内容。</p>
  </el-like-collapse-item>
</el-like-collapse>
```

## 禁用面板

`disabled` 面板不响应点击，保持收起或展开的初始状态：

```vue
<el-like-collapse v-model="activeNames">
  <el-like-collapse-item name="locked" title="禁用面板" disabled>
    <p>禁用面板不可展开或收起。</p>
  </el-like-collapse-item>
</el-like-collapse>
```

## 行为约定

- `modelValue` 遵循不可变更新：组件不修改父组件传入的数组，而是通过 `update:modelValue` / `change` 抛出新数组
- `change` 与 `update:modelValue` 的回调参数一致，均为最新的展开 name 数组
- 手风琴模式下点击已展开面板会将其收起，此时展开集合为空数组
- 父组件修改 `modelValue` 后，面板展开状态随之同步
- `CollapseItem` 脱离 `Collapse` 单独使用时不会报错，但点击不生效（降级为静态面板）

## 样式定制

组件提供以下 CSS 变量，可在 Collapse 或其容器上局部覆盖：

| 变量名                             | 作用             | 默认值                         |
| ---------------------------------- | ---------------- | ------------------------------ |
| `--el-collapse-border-color`       | 面板边框颜色     | `var(--el-border-color-light)` |
| `--el-collapse-header-height`      | 面板头部高度     | `48px`                         |
| `--el-collapse-header-bg-color`    | 头部背景色       | `var(--el-fill-color-blank)`   |
| `--el-collapse-header-text-color`  | 头部文字与箭头色 | `var(--el-text-color-primary)` |
| `--el-collapse-header-font-size`   | 头部字号         | `var(--el-font-size-medium)`   |
| `--el-collapse-content-bg-color`   | 内容区背景色     | `var(--el-fill-color-blank)`   |
| `--el-collapse-content-font-size`  | 内容区字号       | `var(--el-font-size-base)`     |
| `--el-collapse-content-text-color` | 内容区文字颜色   | `var(--el-text-color-regular)` |

## 无障碍说明

- 面板头部是原生 `<button>`，可通过 Tab 聚焦、Enter/Space 切换展开状态
- 展开状态通过 `aria-expanded` 暴露，`aria-controls` 关联内容区域
- 收起后内容移出无障碍树，内部焦点元素不可达
- 禁用面板使用原生 `disabled`，不响应点击与键盘操作

## API

### Collapse Attributes

| 属性名     | 说明                     | 类型       | 是否必填 | 默认值 |
| ---------- | ------------------------ | ---------- | -------- | ------ |
| modelValue | 当前展开面板的 name 数组 | `string[]` | 否       | `[]`   |
| accordion  | 是否开启手风琴模式       | `boolean`  | 否       | false  |

> 在模板中推荐使用 kebab-case：`model-value`；`v-model` 直接绑定展开集合。

### Collapse Events

| 事件名 | 说明                   | 回调参数          |
| ------ | ---------------------- | ----------------- |
| change | 展开集合发生变化时触发 | `value: string[]` |

### CollapseItem Attributes

| 属性名   | 说明                      | 类型      | 是否必填 | 默认值 |
| -------- | ------------------------- | --------- | -------- | ------ |
| name     | 面板唯一标识              | `string`  | 是       | —      |
| title    | 面板标题，缺省时展示 name | `string`  | 否       | ''     |
| disabled | 是否禁用                  | `boolean` | 否       | false  |
