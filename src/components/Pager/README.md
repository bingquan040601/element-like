# Pager 页码

Pager 用于在多个页面之间切换，支持受控当前页、页码窗口折叠、省略号快速跳转、语义主题和不同尺寸。

- 组件已全局注册，模板中直接使用 `<ElLike-Pager>`，无需 import
- `total` 表示总页码数，不是数据总条数
- `currentPage` 采用受控模式，需要在 `current-change` 事件中更新
- `pageCount` 限制数字页码按钮的最大数量，不包含省略号
- 页码较多时保留首页、当前页和尾页，省略号支持快速前后跳页

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const currentPage = ref(1)
</script>

<template>
  <ElLike-Pager :total="20" :current-page="currentPage" @current-change="currentPage = $event" />
</template>
```

`current-change` 只负责通知父组件，Pager 不会直接修改 `currentPage`。点击当前页不会重复触发事件。

## 设置最大页码数

总页数超过 `pageCount` 时，组件会自动折叠中间窗口。点击两侧省略号，可以按照 `pageCount` 的步长快速跳转：

```vue
<ElLike-Pager
  :total="100"
  :current-page="currentPage"
  :page-count="7"
  @current-change="currentPage = $event"
/>
```

常规窗口始终包含首页、当前页和尾页；数字页码按钮不超过 `pageCount`，省略号不计入该数量。

## 主题类型

通过 `type` 设置选中、悬停和焦点状态的强调色：

```vue
<ElLike-Pager :current-page="currentPage" :total="10" type="primary" />
<ElLike-Pager :current-page="currentPage" :total="10" type="success" />
<ElLike-Pager :current-page="currentPage" :total="10" type="warning" />
<ElLike-Pager :current-page="currentPage" :total="10" type="danger" />
<ElLike-Pager :current-page="currentPage" :total="10" type="info" />
```

不传 `type` 或传入 `default` 时使用主色强调。完整示例仍应监听 `current-change` 并更新 `currentPage`。

## 尺寸

支持 `large`、`default` 和 `small` 三种尺寸：

```vue
<ElLike-Pager :current-page="currentPage" :total="10" size="large" />
<ElLike-Pager :current-page="currentPage" :total="10" />
<ElLike-Pager :current-page="currentPage" :total="10" size="small" />
```

## 数值边界

- `total` 小于 0 时按 0 处理，此时不渲染页码
- `currentPage` 超出有效范围时，展示状态会收敛到首页或尾页，但不会自动触发事件
- `pageCount` 最小按 1 处理；窗口较小时优先保证当前页可见
- 数值属性中的小数会被截断，`NaN` 和 `Infinity` 使用对应默认值

## 样式定制

组件提供以下 CSS 变量，可在 Pager 或其容器上局部覆盖：

| 变量名                       | 作用               | 默认值                            |
| ---------------------------- | ------------------ | --------------------------------- |
| `--el-pager-active-color`    | 选中页及焦点颜色   | `var(--el-color-primary)`         |
| `--el-pager-active-bg-color` | 选中页背景色       | `var(--el-color-primary-light-9)` |
| `--el-pager-button-size`     | 页码按钮高度与宽度 | `32px`                            |
| `--el-pager-font-size`       | 页码字号           | `var(--el-font-size-base)`        |

## 无障碍说明

组件根元素为带“分页导航”名称的 `<nav>`，页码使用原生按钮；当前页通过 `aria-current="page"` 标识，省略号按钮提供明确的跳转目标名称。

## API

### Attributes

| 属性名      | 说明                                 | 类型   | 是否必填 | 默认值 |
| ----------- | ------------------------------------ | ------ | -------- | ------ |
| total       | 总页码数                             | number | 否       | 0      |
| currentPage | 当前页码，由父组件控制               | number | 否       | 1      |
| pageCount   | 数字页码按钮最大数量，不包含省略号   | number | 否       | 10     |
| type        | 主题类型                             | string | 否       | —      |
| size        | 尺寸，可选 `large`/`default`/`small` | string | 否       | —      |

> 在模板中推荐使用 kebab-case：`current-page`、`page-count`。`type` 可选 `default`、`primary`、`success`、`warning`、`danger`、`info`。

### Events

| 事件名         | 说明                               | 回调参数       |
| -------------- | ---------------------------------- | -------------- |
| current-change | 点击其他页码或省略号快速跳转时触发 | `page: number` |
