# Tooltip 文字提示

Tooltip 在触发元素附近展示简短的文字提示，支持 hover / click / focus 三种触发方式、打开与关闭延时、手动控制；气泡传送至 body 固定定位，首选位置空间不足时自动翻转到对侧并夹紧在视口内。

- `Tooltip` 已全局注册，模板中直接使用 `<ElLike-Tooltip>`，无需 import
- `content` 传入提示文案，默认插槽放置触发元素
- 气泡带淡入淡出过渡与跟随实际方位的箭头

## 基础用法

hover 触发，默认出现在触发元素左侧：

```vue
<ElLike-Tooltip content="这是提示内容">
  <ElLike-Button>悬停查看</ElLike-Button>
</ElLike-Tooltip>
```

鼠标移入触发元素后经过 `openDelay` 显示气泡，移出后经过 `closeDelay` 关闭；移入气泡本身不会关闭。

## 出现位置

`placement` 支持 `top` / `bottom` / `left` / `right`，气泡沿触发元素居中；首选位置空间不足时自动翻转到对侧，翻转后仍放不下时夹紧到视口内：

```vue
<ElLike-Tooltip placement="top" content="上方提示">
  <ElLike-Button>top</ElLike-Button>
</ElLike-Tooltip>
```

## 触发方式

- `hover`（默认）：悬停显示，`openDelay` / `closeDelay` 生效
- `click`：点击切换显示状态，点击触发元素与气泡之外的区域关闭
- `focus`：触发元素获得焦点时显示，失去焦点时关闭（不经过延时）

```vue
<ElLike-Tooltip trigger="click" content="点击切换，点击外部关闭">
  <ElLike-Button>点击</ElLike-Button>
</ElLike-Tooltip>
```

## 延时控制

`openDelay` / `closeDelay` 单位为毫秒，仅对 `hover` 触发生效：

```vue
<ElLike-Tooltip content="延时 500ms" :open-delay="500" :close-delay="500">
  <ElLike-Button>悬停</ElLike-Button>
</ElLike-Tooltip>
```

## 手动触发

`manual` 开启后忽略 `trigger`，显示状态完全由外部接管。两种控制方式：

1. `v-model:visible` 双向绑定
2. 组件实例方法 `open()` / `close()` / `toggle()`（通过模板 ref 调用）

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <ElLike-Tooltip manual v-model:visible="visible" content="手动控制">
    <ElLike-Button @click="visible = !visible">切换</ElLike-Button>
  </ElLike-Tooltip>
</template>
```

## content 插槽

`content` 插槽可覆盖 `content` 属性，用于自定义富文本内容：

```vue
<ElLike-Tooltip>
  <template #content>
    <b>加粗提示</b> 与更多内容
  </template>
  <ElLike-Button>悬停</ElLike-Button>
</ElLike-Tooltip>
```

## 行为约定

- 延时只对 `hover` 触发生效；`click` / `focus` 与手动调用即时响应
- 气泡 Teleport 到 `body`，`position: fixed` 定位；显示期间页面任意滚动或窗口缩放都会实时重算位置（rAF 节流）
- `placement` 变化时，显示中的气泡立即重算位置，箭头同步指向实际方位
- `manual` 模式下所有自动触发（含点击外部关闭）均失效
- `visible` 传入后（配合 `v-model:visible`）外部接管显示状态，组件内部变化通过 `update:visible` 回抛
- `visible-change` 在气泡实际显示/隐藏后触发（即延时计时结束后）

## 样式定制

组件提供以下 CSS 变量，可在 Tooltip 或其容器上局部覆盖：

| 变量名                    | 作用         | 默认值                            |
| ------------------------- | ------------ | --------------------------------- |
| `--el-tooltip-bg-color`   | 气泡背景色   | `var(--el-text-color-primary)`    |
| `--el-tooltip-text-color` | 气泡文字颜色 | `var(--el-color-white)`           |
| `--el-tooltip-font-size`  | 气泡字号     | `var(--el-font-size-extra-small)` |
| `--el-tooltip-max-width`  | 气泡最大宽度 | `300px`                           |
| `--el-tooltip-padding`    | 气泡内边距   | `8px 12px`                        |

## 无障碍说明

- 气泡使用 `role="tooltip"`；显示期间把气泡 id 关联到默认插槽第一个元素的 `aria-describedby`，屏幕阅读器可读出提示内容
- `focus` 触发方式完全键盘可达：Tab 聚焦即显示，失焦关闭
- 建议默认插槽放置单个可交互元素（如按钮），以获得正确的语义关联

## API

### Tooltip Attributes

| 属性名     | 说明                                                                | 类型      | 是否必填 | 默认值 |
| ---------- | ------------------------------------------------------------------- | --------- | -------- | ------ |
| content    | 提示内容；content 插槽可覆盖                                        | `string`  | 否       | ''     |
| trigger    | 触发方式：hover / click / focus                                     | `string`  | 否       | hover  |
| placement  | 出现位置：top / bottom / left / right，空间不足自动翻转             | `string`  | 否       | left   |
| manual     | 是否手动触发：开启后忽略 trigger，由 v-model:visible 或实例方法控制 | `boolean` | 否       | false  |
| openDelay  | 打开延时（毫秒），仅 hover 触发                                     | `number`  | 否       | 100    |
| closeDelay | 关闭延时（毫秒），仅 hover 触发                                     | `number`  | 否       | 100    |
| visible    | 是否显示气泡；配合 manual 通过 v-model:visible 控制                 | `boolean` | 否       | —      |

### Tooltip Events

| 事件名         | 说明                           | 回调参数           |
| -------------- | ------------------------------ | ------------------ |
| visible-change | 气泡显示状态变化时触发         | `visible: boolean` |
| update:visible | visible 状态更新（供 v-model） | `visible: boolean` |

### Tooltip Slots

| 插槽名  | 说明                        |
| ------- | --------------------------- |
| default | 触发元素                    |
| content | 提示内容，覆盖 content 属性 |

### Tooltip Expose

| 方法名 | 说明                 |
| ------ | -------------------- |
| open   | 立即显示气泡         |
| close  | 立即关闭气泡         |
| toggle | 在显示与关闭之间切换 |
