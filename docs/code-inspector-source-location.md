# Code Inspector 总跳到通用组件内部？原理与解决方案

> 适用场景：Vue 3 + Vite + `code-inspector-plugin`，组件库源码与示例页面位于同一仓库。
>
> 本文示例基于 `code-inspector-plugin@2.0.9`，核心思路同样适用于其他“点击 DOM 跳转源码”的开发工具。

## 一、问题现象

在组件库示例项目中接入 Code Inspector 后，希望点击页面元素直接跳转到**组件调用处**：

```vue
<!-- src/views/ButtonView.vue -->
<template>
  <el-like-button type="primary">确定</el-like-button>
</template>
```

实际却跳到了通用组件内部：

```vue
<!-- src/components/Button/Button.vue -->
<template>
  <button class="el-like-button">
    <slot />
  </button>
</template>
```

| 操作             | 期望位置                                 | 实际位置                         |
| ---------------- | ---------------------------------------- | -------------------------------- |
| 点击按钮         | `ButtonView.vue` 中的 `<el-like-button>` | `Button.vue` 中的原生 `<button>` |
| 点击 Dialog 内容 | `DialogView.vue` 中的 `<el-like-dialog>` | `Dialog.vue` 内部模板            |

这不是 IDE 配置错误，也不是插件随机选错了文件，而是由它的 DOM 定位机制决定的。

## 二、根因：内外两层都有路径，最内层优先

插件会在开发环境转换模板，为元素添加 `data-insp-path`，记录源码文件、行列号和标签名。

组件调用处会被转换为一个携带位置信息的组件 VNode：

```ts
// 概念示意
h(ElLikeButton, {
  'data-insp-path': 'src/views/ButtonView.vue:4:3:el-like-button',
})
```

与此同时，通用组件内部的原生按钮也被注入了自己的位置：

```html
<button data-insp-path="src/components/Button/Button.vue:2:3:button" class="el-like-button">
  确定
</button>
```

浏览器收到点击事件后，插件从 `event.target` 开始向上查找最近的定位属性：

```text
点击原生 button
  → 查找最近的 data-insp-path
  → 命中 Button.vue 的内部路径
  → IDE 打开 Button.vue
```

因此，**真正的问题不是“没有调用处路径”，而是内部路径离点击目标更近，优先被消费了。**

## 三、第一步：排除通用组件内部的定位注入

在 `vite.config.ts` 中，通过 `exclude` 排除组件库实现目录：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { codeInspectorPlugin } from 'code-inspector-plugin'

export default defineConfig({
  plugins: [
    codeInspectorPlugin({
      bundler: 'vite',

      // 只在本地开发环境启用；Vitest 同样使用 serve 模式，需要显式排除。
      dev: () => process.env.NODE_ENV === 'development',

      // 不给通用组件内部 DOM 注入路径，优先保留调用方的位置。
      exclude: /[\\/]src[\\/]components[\\/]/,

      // 可选：只有 .env.local 包含 CODE_INSPECTOR=true 时才启用。
      needEnvInspector: true,
    }),
    vue(),
  ],
})
```

正则同时兼容 `/` 和 `\`，避免 Windows 与类 Unix 系统的路径分隔符差异。

`.env.local` 示例：

```dotenv
CODE_INSPECTOR=true
```

该文件应加入 `.gitignore`，团队公共模板 `.env.example` 可以默认关闭：

```dotenv
CODE_INSPECTOR=false
```

### 为什么普通组件这样就能工作

Button 是单根节点组件。调用处传入的非 prop 属性会通过 Vue 的 fallthrough attrs 机制，自动继承到内部原生 `<button>` 上。

排除内部注入后，同名属性不再被组件实现占用，最终 DOM 上保留的是调用处的位置：

```html
<button data-insp-path="src/views/ButtonView.vue:4:3:el-like-button">确定</button>
```

点击后便会跳转到 `ButtonView.vue`。

## 四、第二步：处理 Teleport 和多根节点组件

只配置 `exclude` 还不完整。

Vue 的自动属性继承主要适用于单根节点组件。以下结构无法可靠地把调用方属性自动继承到目标 DOM：

- 根节点是 `Teleport`，例如 Dialog；
- 模板存在多个根节点，例如 Tooltip、Cascader；
- 实际展示内容被传送到了 `document.body`，已经脱离原组件 DOM 层级。

如果直接排除这些组件的内部路径，却不转发调用方属性，结果会从“跳到内部实现”变成“完全没有定位信息”。

### Dialog：转发到遮罩层

```vue
<template>
  <Teleport to="body">
    <Transition name="el-like-dialog-fade">
      <div
        v-if="visible"
        v-bind="$attrs"
        class="el-like-dialog__overlay"
        @click.self="handleOverlayClick"
      >
        <div class="el-like-dialog" role="dialog" aria-modal="true">
          <!-- 标题、主体和底部插槽 -->
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ElLike-Dialog',
  inheritAttrs: false,
})
</script>
```

`inheritAttrs: false` 用于关闭隐式继承，再由 `v-bind="$attrs"` 明确指定接收属性的真实 DOM。

Dialog 将属性放在遮罩层，而不是只放在内容面板上，有这样一个好处：

```text
点击标题、正文或底部按钮
  → 向上查找最近的 data-insp-path
  → 命中遮罩层上的调用方路径
  → 跳转到 DialogView.vue 中的 <el-like-dialog>
```

### Tooltip、Cascader：转发到实际触发区

多根节点组件同样需要明确接收属性的节点，例如：

```vue
<!-- Tooltip：触发区域 -->
<span ref="triggerRef" v-bind="$attrs" class="el-like-tooltip__trigger">
  <slot />
</span>
```

```vue
<!-- Cascader：输入控制区根节点 -->
<div ref="rootRef" v-bind="$attrs" class="el-like-cascader">
  <!-- 输入框、标签和下拉面板 -->
</div>
```

两个组件同样需要设置 `inheritAttrs: false`。

> 不建议把完整的 `$attrs` 同时绑定到多个 DOM 节点，否则可能重复应用 `id`、事件监听器、class 等属性。应选择一个主要交互根节点；特殊场景可以只挑选需要转发的属性。

## 五、如何验证修复是否生效

不必每次都打开 IDE，直接在浏览器控制台检查真实 DOM 上的路径即可。

### Button

```js
document.querySelector('.el-like-button')?.getAttribute('data-insp-path')
```

期望结果：

```text
src/views/ButtonView.vue:44:9:el-like-button
```

而不是：

```text
src/components/Button/Button.vue:2:3:button
```

### Dialog

```js
document
  .querySelector('.el-like-dialog__body')
  ?.closest('[data-insp-path]')
  ?.getAttribute('data-insp-path')
```

期望结果：

```text
src/views/DialogView.vue:28:7:el-like-dialog
```

本项目的浏览器验证结果：

| 点击对象        | 最终定位信息                                        |
| --------------- | --------------------------------------------------- |
| Button          | `src/views/ButtonView.vue:44:9:el-like-button`      |
| Dialog 及其内容 | `src/views/DialogView.vue:28:7:el-like-dialog`      |
| Cascader        | `src/views/CascaderView.vue:122:7:el-like-cascader` |
| Tooltip 触发区  | `src/views/TooltipView.vue:34:7:el-like-tooltip`    |

同时补充了调用方属性转发的单元测试；完整回归共 149 个测试通过，类型检查与生产构建通过。

> 如果项目同时启用了 Vue DevTools，可能还会看到 `data-v-inspector`。它与本文讨论的 `data-insp-path` 属于不同工具，排查时不要混淆。

## 六、为什么不优先使用其他配置

| 方案           | 不适合本问题的原因                                        |
| -------------- | --------------------------------------------------------- |
| `escapeTags`   | 按标签名跳过注入，范围过粗，容易把调用处也一起排除        |
| `mappings`     | 适合做静态路径映射，无法自动推导每个组件的真实调用位置    |
| `pathFormat`   | 只改变传给 IDE 的路径格式，不改变插件选择了哪个 DOM 路径  |
| 修改编辑器配置 | 编辑器只负责打开传入的文件，无法解决 DOM 层的路径选择问题 |

## 七、适用边界与取舍

这套方案适合**组件库文档站、示例工程优先定位调用处**的开发方式，但有一个明确取舍：

- 业务开发时，点击元素跳转到调用处，符合大多数调试需求；
- 组件库维护时，无法再直接通过该插件跳到通用组件内部实现。

需要调试组件库源码时，可以临时移除 `exclude`，或者只排除当前不关注的组件目录。也可以按本地环境变量提供“调用处优先”和“组件内部优先”两套配置。

如果业务项目消费的是已经发布到 `node_modules` 的组件库，插件通常默认排除依赖目录，本问题不一定出现；它更容易发生在**组件源码和示例页面同仓库、通过别名直接引用源码**的场景。

修改 Vite 配置后，如开发服务器没有自动重载，需要重启：

```sh
pnpm dev
```

## 八、总结

这个问题可以归纳成两句话：

1. **定位目标冲突**：组件内部和调用处都有源码路径，插件按照 DOM 就近原则选中了内部路径。
2. **修复需要两步**：先排除组件内部注入，再保证调用方属性能穿透单根节点、Teleport 和多根节点结构，落到真实 DOM 上。

最终定位链路变为：

```text
点击页面元素
  → 查找最近的 data-insp-path
  → 获取组件调用处的位置
  → IDE 打开对应的 View / 业务组件
```

理解这一点后，同类“源码跳转总是进入通用组件”的问题，都可以从**路径注入范围**和**属性继承链路**两个方向排查。
