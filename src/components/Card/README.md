# Card 卡片

Card 用于展示由图片、摘要和底部操作区组成的内容卡片，支持固定尺寸、纯文本摘要以及自定义插槽内容。

- 组件已全局注册，模板中直接使用 `<el-like-card>`，无需 import
- `imgSrc` 为必填属性，其余属性与插槽均可选
- 未设置 `width` 时，卡片宽度由父容器或外部布局决定
- 未设置 `imgHeight` 时，图片保持原始宽高比
- 颜色、边框、圆角、字号和间距均消费全局设计 Token

## 何时使用

适合展示文章、商品、景点、课程等以图片为主的内容。需要自定义标题、标签或操作按钮时，可以组合使用默认插槽和 `footer` 插槽。

## 示例图片说明

以下示例统一使用 `cardImage` 作为图片地址。项目中可以直接导入已有的示例资源：

```vue
<script setup lang="ts">
import cardImage from '@/assets/card-demo.svg'
</script>
```

也可以将 `cardImage` 替换为其他本地图片或有效的远程图片 URL。

## 基础用法

传入 `imgSrc` 和 `summary` 即可组成基础卡片：

```vue
<el-like-card :img-src="cardImage" summary="在熟悉的风景里，留一点时间给自己。" />
```

未传 `width` 时，卡片作为块级元素由父容器控制宽度；未传 `imgHeight` 时，图片按照原始比例展示。

## 自定义尺寸

`width` 控制卡片整体宽度，`imgHeight` 控制图片高度，数值单位均为 `px`：

```vue
<el-like-card
  :width="360"
  :img-src="cardImage"
  :img-height="180"
  summary="宽度为 360px，图片高度为 180px。"
/>
```

> `width` 和 `imgHeight` 是 Number 类型，模板中应使用 `:` 绑定数值。设置 `imgHeight` 后，图片通过 `object-fit: cover` 填满可用区域，避免拉伸变形。

## 纯图片卡片

`summary` 和默认插槽均不传时，不会渲染摘要容器，可用于纯图片卡片：

```vue
<el-like-card :width="320" :img-src="cardImage" :img-height="160" />
```

## 自定义摘要内容

未传 `summary` 时，可以通过默认插槽放置标题、富文本、标签等任意内容：

```vue
<el-like-card :width="360" :img-src="cardImage" :img-height="170">
  <div>
    <h3>在山野之间</h3>
    <p>默认插槽不再局限于纯文本，可以按照业务需求自由组织内容。</p>
  </div>
</el-like-card>
```

非空 `summary` 的优先级高于默认插槽；两者同时传入时，只展示 `summary`。`summary` 为空字符串时视为未传入。

## Footer 底部操作区

通过 `footer` 插槽添加底部信息或操作按钮。未使用该插槽时，不会渲染 footer 容器：

```vue
<template>
  <el-like-card
    :width="360"
    :img-src="cardImage"
    :img-height="170"
    summary="通过 footer 插槽放置底部信息和操作区。"
  >
    <template #footer>
      <div class="card-footer">
        <span>6 分钟阅读</span>
        <el-like-button type="primary" size="small">阅读全文</el-like-button>
      </div>
    </template>
  </el-like-card>
</template>

<style scoped>
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
```

组件只提供 footer 容器的内边距和顶部分隔线，插槽内容的布局与样式由使用方决定。

## 样式定制

组件提供 `--el-card-*` CSS 变量，可以在单个卡片或其容器上局部覆盖：

```vue
<template>
  <el-like-card class="custom-card" :img-src="cardImage" summary="通过 CSS 变量局部定制卡片样式。" />
</template>

<style scoped>
.custom-card {
  --el-card-border-radius: 12px;
  --el-card-padding: 16px;
  --el-card-box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
}
</style>
```

支持的组件变量：

| 变量名                    | 作用                       | 默认值                          |
| ------------------------- | -------------------------- | ------------------------------- |
| `--el-card-bg-color`      | 卡片背景色                 | `var(--el-bg-color)`            |
| `--el-card-border-color`  | 卡片及 footer 分隔线颜色   | `var(--el-border-color-light)`  |
| `--el-card-border-radius` | 卡片圆角                   | `var(--el-border-radius-base)`  |
| `--el-card-box-shadow`    | 卡片阴影                   | `0 2px 12px 0 rgb(0 0 0 / 10%)` |
| `--el-card-padding`       | 摘要和 footer 的水平内边距 | `20px`                          |

## 无障碍说明

卡片图片当前按装饰图片处理，使用空的 `alt` 属性，避免屏幕阅读器重复朗读相邻文本。如果图片包含重要信息，应通过 `summary` 或插槽提供等价的文字说明，不要只依赖图片传达内容。

## API

### Attributes

| 属性名    | 说明                                      | 类型   | 是否必填 | 默认值 |
| --------- | ----------------------------------------- | ------ | -------- | ------ |
| width     | 卡片整体宽度，单位为 `px`                 | number | 否       | —      |
| imgSrc    | 卡片图片地址                              | string | 是       | —      |
| imgHeight | 图片高度，单位为 `px`；不传时保持原始比例 | number | 否       | —      |
| summary   | 纯文本摘要；优先于默认插槽                | string | 否       | —      |

> 在模板中推荐使用 kebab-case：`img-src`、`img-height`。未声明的 `class`、`style` 和 `aria-*` 等属性会透传到根 `<div>`。

### Slots

| 插槽名  | 说明                                          |
| ------- | --------------------------------------------- |
| default | 自定义摘要内容；仅在未传非空 `summary` 时展示 |
| footer  | 自定义底部内容；容器提供内边距和顶部分隔线    |
