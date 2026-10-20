# Dialog 对话框

Dialog 用于在当前页面之上展示需要用户关注或处理的内容，支持自定义尺寸、标题、主体和底部操作区。

- 组件已全局注册，模板中直接使用 `<el-like-dialog>`，无需 import
- 通过 `Teleport` 挂载到 `body`，避免受到页面局部定位上下文影响
- `visible` 采用受控模式，由父组件管理显示状态
- 默认插槽、`title` 插槽和 `footer` 插槽支持任意自定义内容
- 支持关闭按钮、遮罩点击和 Esc 三种关闭交互

## 何时使用

适合确认操作、展示补充信息或承载简短表单。复杂且需要长期停留的编辑流程，优先考虑独立页面，避免对话框内容过于复杂。

## 基础用法

通过 `visible` 控制显示状态，并监听 `close` 事件关闭对话框：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const dialogVisible = ref(false)
</script>

<template>
  <el-like-button type="primary" @click="dialogVisible = true">打开对话框</el-like-button>

  <el-like-dialog :visible="dialogVisible" title="操作提示" @close="dialogVisible = false">
    <p>这里是对话框主体，可以放置文本、表单或其他组件。</p>

    <template #footer>
      <el-like-button @click="dialogVisible = false">取消</el-like-button>
      <el-like-button type="primary" @click="dialogVisible = false">确定</el-like-button>
    </template>
  </el-like-dialog>
</template>
```

> `close` 事件只负责通知父组件，组件不会直接修改 `visible`。收到事件后，需要将对应的显示状态设为 `false`。

未传 `title` 时，默认显示“提示”。未使用默认插槽或 `footer` 插槽时，不会渲染对应的空容器。

## 自定义尺寸

`width` 和 `top` 接收 String 类型，支持任意有效的 CSS 宽度或长度值：

```vue
<el-like-dialog
  :visible="dialogVisible"
  title="自定义尺寸"
  width="640px"
  top="8vh"
  @close="dialogVisible = false"
>
  <p>当前宽度为 640px，距离视口顶部 8vh。</p>
</el-like-dialog>
```

- `width` 默认值为 `50%`
- `top` 默认值为 `15vh`，通过对话框的上外边距实现
- 窄屏下最大宽度限制为 `calc(100% - 32px)`，避免横向溢出
- 内容高度超过视口时，由遮罩层提供纵向滚动

## 控制遮罩点击关闭

`closeOnClickModal` 用于控制点击遮罩是否触发 `close`，默认值为 `true`：

```vue
<el-like-dialog
  :visible="dialogVisible"
  :close-on-click-modal="false"
  title="编辑资料"
  @close="dialogVisible = false"
>
  <p>编辑过程中点击遮罩不会关闭对话框。</p>
</el-like-dialog>
```

| 配置           | 点击遮罩       | 关闭按钮 / Esc |
| -------------- | -------------- | -------------- |
| `true`（默认） | 触发 `close`   | 触发 `close`   |
| `false`        | 不触发 `close` | 仍触发 `close` |

该属性只控制遮罩点击，不会禁用关闭按钮或 Esc。对话框内容区域的点击不会触发遮罩关闭。

## 自定义标题

`title` 插槽可以覆盖 `title` 属性，用于组合图标、状态标签或其他自定义内容：

```vue
<el-like-dialog :visible="dialogVisible" @close="dialogVisible = false">
  <template #title>
    <span>
      <el-like-icon icon="paper-plane" type="primary" />
      发布新版本
    </span>
  </template>

  <p>使用 title 插槽后，title 属性不再作为标题内容展示。</p>
</el-like-dialog>
```

关闭按钮独立于标题插槽，自定义标题时仍会保留。

## 自定义主体与 Footer

默认插槽可以承载任意主体内容，`footer` 插槽可以自由组合底部操作区：

```vue
<template>
  <el-like-dialog
    :visible="dialogVisible"
    title="版本说明"
    width="520px"
    @close="dialogVisible = false"
  >
    <div>
      <h3>本次更新</h3>
      <ul>
        <li>优化页面交互体验</li>
        <li>修复已知问题</li>
      </ul>
    </div>

    <template #footer>
      <div class="dialog-actions">
        <el-like-button @click="dialogVisible = false">稍后处理</el-like-button>
        <el-like-button type="primary" @click="dialogVisible = false">立即发布</el-like-button>
      </div>
    </template>
  </el-like-dialog>
</template>

<style scoped>
.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
}
</style>
```

组件只提供 footer 容器的间距，插槽内容的对齐方式和布局由使用方决定。开发服务器的 `/dialog` 页面还提供了表单主体示例。

## 样式定制

对话框主体提供 `--el-dialog-*` CSS 变量。由于内容通过 `Teleport` 挂载到 `body`，主题覆盖应放在全局样式中，并确保在组件库样式之后加载：

```css
.el-like-dialog {
  --el-dialog-border-radius: 12px;
  --el-dialog-padding: 24px;
}
```

支持的组件变量：

| 变量名                      | 作用                         | 默认值                           |
| --------------------------- | ---------------------------- | -------------------------------- |
| `--el-dialog-bg-color`      | 对话框背景色                 | `var(--el-bg-color)`             |
| `--el-dialog-border-radius` | 对话框圆角                   | `var(--el-border-radius-base)`   |
| `--el-dialog-box-shadow`    | 对话框阴影                   | `0 12px 32px 0 rgb(0 0 0 / 20%)` |
| `--el-dialog-padding`       | 头部、主体和 footer 间距基准 | `20px`                           |

## 无障碍说明

- 对话框主体使用 `role="dialog"` 和 `aria-modal="true"`
- 标题通过 `aria-labelledby` 与对话框关联
- 关闭按钮提供“关闭对话框”无障碍名称
- 使用 `title` 插槽时，仍应提供能够准确描述对话框用途的标题文本

## API

### Attributes

| 属性名            | 说明                                    | 类型    | 是否必填 | 默认值 |
| ----------------- | --------------------------------------- | ------- | -------- | ------ |
| title             | 对话框标题；可被 `title` 插槽覆盖       | string  | 否       | 提示   |
| width             | 对话框宽度，支持有效 CSS 宽度值         | string  | 否       | 50%    |
| top               | 距离视口顶部的间距，支持有效 CSS 长度值 | string  | 否       | 15vh   |
| visible           | 是否显示对话框，由父组件控制            | boolean | 否       | false  |
| closeOnClickModal | 点击遮罩是否触发 `close`                | boolean | 否       | true   |

> 在模板中推荐使用 kebab-case：`close-on-click-modal`。

### Events

| 事件名 | 说明                                          | 回调参数 |
| ------ | --------------------------------------------- | -------- |
| close  | 点击关闭按钮、允许的遮罩点击或按下 Esc 时触发 | 无       |

### Slots

| 插槽名  | 说明                                           |
| ------- | ---------------------------------------------- |
| default | 自定义主体内容；未使用时不会渲染主体容器       |
| title   | 自定义标题内容，优先级高于 `title` 属性        |
| footer  | 自定义底部操作区；未使用时不会渲染 footer 容器 |
