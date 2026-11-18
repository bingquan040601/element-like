---
name: vue-sfc-order
description: 统一 Vue 单文件组件（SFC）的顶层区块顺序为 template → script → style。创建、修改、重构或审查 .vue 文件，以及处理组件结构、代码风格时使用。
---

# Vue SFC 区块顺序

所有 Vue 单文件组件必须按以下顺序组织顶层区块：

1. `<template>`：组件模板
2. `<script>`：组件逻辑，通常使用 `<script setup lang="ts">`
3. `<style>`：组件样式

没有样式时省略 `<style>`，不要添加空样式区块。保留各区块原有属性与内容，例如 `setup`、`lang`、`generic`、`scoped` 和 `module`。

## 标准结构

```vue
<template>
  <div class="example">示例</div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped lang="scss">
.example {
  /* 组件样式 */
}
</style>
```

## 工作方式

- 新建组件时直接采用上述顺序。
- 修改现有组件时检查顶层区块顺序；仅顺序不符时只移动区块，不改变组件行为。
- 项目已通过 ESLint 的 `vue/block-order` 规则约束该顺序，可以自动修复：

```bash
pnpm exec eslint "src/**/*.vue" --fix
```

- 完成组件调整后运行检查：

```bash
pnpm exec eslint "src/**/*.vue"
pnpm type-check
```

如改动范围超出 `src/`，则对相应目录或整个项目执行 ESLint。不要使用 Prettier 代替此检查：Prettier 不负责调整 SFC 顶层区块顺序。
