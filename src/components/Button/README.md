# Button 按钮

按钮用于触发操作，支持语义主题、不同尺寸、朴素/圆角/圆形形态，以及图标、禁用和加载状态。

- 组件已全局注册，模板中直接使用 `<ElLike-Button>`，无需 import
- 颜色、字号、圆角和过渡均消费全局设计 Token
- 图标复用 `ElLike-Icon`，图标名称不含 `fa-` 前缀
- 根元素为原生 `<button type="button">`，不会在表单中意外触发提交

## 何时使用

需要执行提交、删除、发送、确认等操作时使用。若只是页面跳转，优先使用链接；若按钮只展示图标，必须为按钮提供 `aria-label`。

## 基础用法

`type` 用于设置按钮主题：

```vue
<ElLike-Button>默认按钮</ElLike-Button>
<ElLike-Button type="primary">主要按钮</ElLike-Button>
<ElLike-Button type="success">成功按钮</ElLike-Button>
<ElLike-Button type="warning">警告按钮</ElLike-Button>
<ElLike-Button type="danger">危险按钮</ElLike-Button>
<ElLike-Button type="info">信息按钮</ElLike-Button>
```

## 朴素按钮

添加 `plain` 后，按钮使用浅色背景和主题色文字：

```vue
<ElLike-Button plain>默认按钮</ElLike-Button>
<ElLike-Button type="primary" plain>主要按钮</ElLike-Button>
<ElLike-Button type="success" plain>成功按钮</ElLike-Button>
<ElLike-Button type="danger" plain>危险按钮</ElLike-Button>
```

## 圆角与圆形按钮

`round` 用于圆角按钮，`circle` 用于圆形按钮：

```vue
<ElLike-Button round>圆角按钮</ElLike-Button>
<ElLike-Button type="primary" round>主要按钮</ElLike-Button>

<ElLike-Button type="primary" icon="paper-plane" circle aria-label="发送" />
<ElLike-Button type="danger" icon="trash" circle plain aria-label="删除" />
```

> 圆形图标按钮没有文字内容，必须通过 `aria-label` 为辅助技术提供按钮名称。

## 不同尺寸

`size` 支持 `large`、`default` 和 `small`。不传或使用 `default` 时均为基础尺寸：

```vue
<ElLike-Button type="primary" size="large">大型按钮</ElLike-Button>
<ElLike-Button type="primary">默认按钮</ElLike-Button>
<ElLike-Button type="primary" size="small">小型按钮</ElLike-Button>
```

`circle` 可以与 `size` 组合，按钮宽高会随尺寸同步变化：

```vue
<ElLike-Button type="primary" icon="gear" size="large" circle aria-label="设置" />
<ElLike-Button type="primary" icon="gear" size="small" circle aria-label="设置" />
```

## 图标按钮

通过 `icon` 传入 fontawesome solid 图标名，不需要添加 `fa-` 前缀：

```vue
<ElLike-Button type="primary" icon="paper-plane">发送</ElLike-Button>
<ElLike-Button type="success" icon="check">完成</ElLike-Button>
<ElLike-Button type="danger" icon="trash">删除</ElLike-Button>
```

图标仅作为装饰，不会对辅助技术重复朗读；按钮含义应由默认插槽文字或 `aria-label` 提供。

## 禁用状态

添加 `disabled` 后，原生按钮会被禁用，无法触发点击事件：

```vue
<ElLike-Button disabled>禁用按钮</ElLike-Button>
<ElLike-Button type="primary" disabled>禁用按钮</ElLike-Button>
<ElLike-Button type="primary" plain disabled>朴素禁用按钮</ElLike-Button>
```

## 加载状态

添加 `loading` 后，按钮显示旋转的加载图标、设置 `aria-busy="true"`，并禁止点击：

```vue
<ElLike-Button type="primary" loading>提交中</ElLike-Button>
```

加载图标会暂时替代 `icon` 指定的普通图标；加载结束后，如果传入了 `icon`，普通图标会重新显示。未传 `icon` 时，默认插槽内容不受影响。

```vue
<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    // 执行异步提交
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <ElLike-Button type="primary" icon="paper-plane" :loading="loading" @click="submit">
    提交
  </ElLike-Button>
</template>
```

## 点击事件

`click` 事件携带原生 `MouseEvent`。`disabled` 或 `loading` 为 `true` 时不会触发：

```vue
<script setup lang="ts">
function handleClick(event: MouseEvent) {
  console.log('按钮被点击', event)
}
</script>

<template>
  <ElLike-Button type="primary" @click="handleClick">主要按钮</ElLike-Button>
</template>
```

## 获取根元素

组件通过 `ref` 属性暴露原生 `HTMLButtonElement`：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const btnRef = ref<{ ref: HTMLButtonElement | null } | null>(null)

function focusButton() {
  btnRef.value?.ref?.focus()
}
</script>

<template>
  <ElLike-Button ref="btnRef" type="primary" @click="focusButton"> 点击后聚焦自身 </ElLike-Button>
</template>
```

其中：

- `btnRef.value`：组件公开实例
- `btnRef.value?.ref`：原生 `<button>` 根元素

## 样式定制

组件颜色状态通过 `--el-button-*` CSS 变量消费，可以在单个按钮或其容器上局部覆盖，不会影响全局 Token：

```vue
<template>
  <ElLike-Button class="custom-button">自定义按钮</ElLike-Button>
</template>

<style scoped>
.custom-button {
  --el-button-text-color: var(--el-color-primary);
  --el-button-border-color: var(--el-color-primary);
}
</style>
```

支持的状态变量：

| 变量名                              | 作用              |
| ----------------------------------- | ----------------- |
| `--el-button-text-color`            | 默认文字颜色      |
| `--el-button-bg-color`              | 默认背景颜色      |
| `--el-button-border-color`          | 默认边框颜色      |
| `--el-button-hover-text-color`      | 悬停/焦点文字颜色 |
| `--el-button-hover-bg-color`        | 悬停/焦点背景颜色 |
| `--el-button-hover-border-color`    | 悬停/焦点边框颜色 |
| `--el-button-active-text-color`     | 按下文字颜色      |
| `--el-button-active-bg-color`       | 按下背景颜色      |
| `--el-button-active-border-color`   | 按下边框颜色      |
| `--el-button-disabled-text-color`   | 禁用文字颜色      |
| `--el-button-disabled-bg-color`     | 禁用背景颜色      |
| `--el-button-disabled-border-color` | 禁用边框颜色      |
| `--el-button-outline-color`         | 键盘焦点轮廓颜色  |

## API

### Attributes

| 属性名   | 说明                                     | 类型    | 可选值                                                | 默认值  |
| -------- | ---------------------------------------- | ------- | ----------------------------------------------------- | ------- |
| type     | 主题类型                                 | string  | default / primary / success / warning / danger / info | default |
| size     | 按钮尺寸                                 | string  | large / default / small                               | —       |
| plain    | 是否为朴素按钮                           | boolean | —                                                     | false   |
| round    | 是否为圆角按钮                           | boolean | —                                                     | false   |
| circle   | 是否为圆形按钮                           | boolean | —                                                     | false   |
| disabled | 是否禁用                                 | boolean | —                                                     | false   |
| loading  | 是否加载中；加载时禁止点击并显示加载图标 | boolean | —                                                     | false   |
| icon     | 图标名称，不含 `fa-` 前缀                | string  | fontawesome solid 图标名                              | —       |

> 未列出的原生属性和 `aria-*` 属性会透传到根 `<button>`。组件的 `type` 表示主题类型，原生按钮类型固定为 `button`。

### Events

| 事件名 | 说明                         | 回调参数            |
| ------ | ---------------------------- | ------------------- |
| click  | 点击非禁用、非加载按钮时触发 | `event: MouseEvent` |

### Slots

| 插槽名  | 说明                                     |
| ------- | ---------------------------------------- |
| default | 按钮内容；没有内容时不会渲染空的内容容器 |

### Expose

| 名称 | 说明           | 类型                        |
| ---- | -------------- | --------------------------- |
| ref  | 原生按钮根元素 | `HTMLButtonElement \| null` |
