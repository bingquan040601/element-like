# Dropdown 下拉菜单

Dropdown 在触发元素附近展示选项菜单，选择条目后触发 `select` 事件。它完整复用 Tooltip 的显示 / 定位 / 触发机制（含翻转、视口夹紧、滚动重算、Teleport），继承 Tooltip 全部属性，仅覆盖两个默认值：`trigger` 默认 `click`、`placement` 默认 `bottom`。

- `Dropdown` 已全局注册，模板中直接使用 `<el-like-dropdown>`，无需 import
- `menuOptions` 传入条目数组，默认插槽放置触发元素
- 条目为原生 `button`，Tab + Enter 即可完成键盘操作

## 基础用法

默认点击触发、向下展开；`hideAfterClick` 默认 `false`，选择条目后菜单保持打开（再次点击触发元素或点击外部区域关闭）：

```vue
<script setup lang="ts">
import type { DropdownMenuOption } from '@/components/Dropdown/props'

const options: DropdownMenuOption[] = [
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
  { label: '删除', value: 'delete' },
]
</script>

<template>
  <el-like-dropdown :menu-options="options" @select="(option) => console.log(option.value)">
    <el-like-button>操作</el-like-button>
  </el-like-dropdown>
</template>
```

`select` 事件的参数为被选中的完整条目对象（含 `label` / `value` 等字段）。

## 点击后隐藏

`hideAfterClick` 为 `true` 时，点击条目后立即关闭下拉：

```vue
<el-like-dropdown :menu-options="options" hide-after-click>
  <el-like-button>选择后关闭</el-like-button>
</el-like-dropdown>
```

## 禁用与分割线

条目设置 `disabled` 后不触发 `select`、点击也不会关闭下拉；设置 `divided` 后在该条目上方显示分割线：

```vue
<script setup lang="ts">
const options = [
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
  { label: '上传', value: 'upload', divided: true },
  { label: '删除', value: 'delete', disabled: true },
]
</script>

<template>
  <el-like-dropdown :menu-options="options" hide-after-click>
    <el-like-button>带状态条目</el-like-button>
  </el-like-dropdown>
</template>
```

## 带图标条目

条目设置 `icon`（fontawesome solid 图标名，不含 `fa-` 前缀）后展示图标，图标颜色跟随条目文字状态：

```vue
<el-like-dropdown
  :menu-options="[
    { label: '编辑', value: 'edit', icon: 'pen-to-square' },
    { label: '下载', value: 'download', icon: 'download' },
    { label: '删除', value: 'delete', icon: 'trash-can' },
  ]"
  hide-after-click
>
  <el-like-button>图标菜单</el-like-button>
</el-like-dropdown>
```

## 继承 Tooltip 属性

`trigger` / `placement` / `openDelay` / `closeDelay` / `manual` / `visible` / `popperClass` 等 Tooltip 属性全部可用，语义与 [Tooltip](../Tooltip/README.md) 一致：

```vue
<!-- hover 触发、向右展开 -->
<el-like-dropdown trigger="hover" placement="right" :menu-options="options">
  <el-like-button>悬停展开</el-like-button>
</el-like-dropdown>

<!-- manual 模式：v-model:visible 完全接管显示状态 -->
<script setup lang="ts">
const visible = ref(false)
</script>

<template>
  <el-like-dropdown manual v-model:visible="visible" :menu-options="options">
    <el-like-button @click="visible = !visible">手动切换</el-like-button>
  </el-like-dropdown>
</template>
```

## 事件

`visible-change` 在显示状态改变后触发；`select` 在选择具体条目后触发：

```vue
<el-like-dropdown
  :menu-options="options"
  @visible-change="(visible) => console.log(visible)"
  @select="(option) => console.log(option)"
>
  <el-like-button>观察事件</el-like-button>
</el-like-dropdown>
```

## 行为约定

- 点击条目先触发 `select`，再按 `hideAfterClick` 决定是否关闭；`disabled` 条目不触发 `select`、也不会导致关闭
- 默认 `trigger` 为 `click`（Tooltip 为 `hover`）、默认 `placement` 为 `bottom`（Tooltip 为 `left`），其余继承属性的默认值与 Tooltip 相同
- 菜单在 Tooltip 气泡内渲染，自动获得空间不足翻转、视口夹紧、滚动 / 缩放时重算位置等能力
- `content` 属性被菜单插槽覆盖，传了也不会有实际效果
- 事件透传：`visible-change` 原样上抛；`update:visible` 让继承的 `visible` 属性支持 `v-model:visible`

## 样式定制

气泡本质上是 Tooltip，[Tooltip 的 CSS 变量](../Tooltip/README.md#样式定制)（如 `--el-tooltip-box-shadow`）全部生效；面板底色、内边距等已被 Dropdown 内置样式覆盖。深度定制气泡时使用 `popper-class` 附加自定义类名，组件内部固定的 `el-like-dropdown` 类会与之合并：

```vue
<el-like-dropdown popper-class="my-dropdown" :menu-options="options">
  <el-like-button>自定义样式</el-like-button>
</el-like-dropdown>
```

```css
.el-like-tooltip.my-dropdown {
  min-width: 160px;
}
```

## 无障碍说明

- 菜单使用 `role="menu"`，条目为 `role="menuitem"` 的原生按钮：Tab 聚焦、Enter / Space 选中，`disabled` 条目不可聚焦
- 触发方式支持 Tooltip 的 `focus`：触发元素聚焦显示、失焦关闭
- 建议默认插槽放置单个可交互元素（如按钮）

## API

Dropdown 继承 Tooltip 全部属性（`content` / `trigger` / `placement` / `manual` / `openDelay` / `closeDelay` / `visible` / `popperClass`），差异仅在于 `trigger` 默认 `click`、`placement` 默认 `bottom`。以下仅列出 Dropdown 自有属性：

### Dropdown Attributes

| 属性名         | 说明                   | 类型                   | 是否必填 | 默认值  |
| -------------- | ---------------------- | ---------------------- | -------- | ------- |
| menuOptions    | 下拉内容条目数组       | `DropdownMenuOption[]` | 是       | 无      |
| hideAfterClick | 点击条目后是否隐藏下拉 | `boolean`              | 否       | false   |

`DropdownMenuOption` 类型定义：

| 字段名   | 说明                                         | 类型      | 是否必填 |
| -------- | -------------------------------------------- | --------- | -------- |
| label    | 条目显示文本                                 | `string`  | 是       |
| value    | 条目值，随 select 事件返回                   | `unknown` | 否       |
| disabled | 是否禁用：不触发 select，点击也不会关闭下拉  | `boolean` | 否       |
| divided  | 是否在该条目上方显示分割线                   | `boolean` | 否       |
| icon     | 条目图标：fontawesome solid 图标名（无 fa-） | `string`  | 否       |

### Dropdown Events

| 事件名         | 说明                                             | 回调参数                    |
| -------------- | ------------------------------------------------ | --------------------------- |
| visible-change | 显示状态改变后触发（继承 Tooltip）               | `(visible: boolean)`        |
| update:visible | 可见状态更新（继承 Tooltip，供 v-model:visible） | `(visible: boolean)`        |
| select         | 选择了具体的某个条目                             | `(option: DropdownMenuOption)` |

### Dropdown Slots

| 插槽名  | 说明     |
| ------- | -------- |
| default | 触发元素 |
