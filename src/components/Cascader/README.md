# Cascader 级联选择器

从层级关联的数据中选择节点，交互与主要 API 参考 Element Plus Cascader。支持单选、多选、任意级选择、搜索、异步懒加载、自定义字段和键盘操作。

## 基础用法

`v-model` 默认保存从根节点到选中节点的完整 `value` 路径。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { CascaderOption, CascaderValue } from 'element-like'

const value = ref<CascaderValue>([])
const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [{ value: 'xihu', label: '西湖' }],
      },
    ],
  },
]
</script>

<template>
  <el-like-cascader v-model="value" :options="options" clearable />
  <!-- 选中西湖后：['zhejiang', 'hangzhou', 'xihu'] -->
</template>
```

## 多选

在 `props` 中开启 `multiple`。默认只能选择叶子节点，父级复选框会联动所有未禁用的后代叶子，并展示半选状态。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { CascaderValue } from 'element-like'

const value = ref<CascaderValue>([])
</script>

<template>
  <el-like-cascader
    v-model="value"
    :options="options"
    :props="{ multiple: true }"
    collapse-tags
    :max-collapse-tags="2"
    clearable
  />
  <!-- [['zhejiang', 'hangzhou', 'xihu'], ['jiangsu', 'nanjing', 'xuanwuhu']] -->
</template>
```

多选与 `checkStrictly: true` 同时开启时，每一级都可独立选中，父子节点不再联动。输入框为空时按 Backspace 可移除最后一个标签。

## 任意级选择与 hover 展开

```vue
<el-like-cascader
  v-model="value"
  :options="options"
  :props="{ checkStrictly: true, expandTrigger: 'hover' }"
/>
```

## 搜索

```vue
<el-like-cascader v-model="value" :options="options" filterable :debounce="200" />
```

默认按完整路径的大小写不敏感匹配。`filterMethod(node, keyword)` 可自定义匹配规则；`beforeFilter(keyword)` 返回 `false` 或 Promise resolve `false` 时取消本次搜索。搜索面板支持 ↑ / ↓ 移动、Enter 选择、Esc 关闭。

## 懒加载

懒加载节点通过 `leaf: true` 标记叶子。`lazyLoad` 既支持 Element Plus 风格的 `resolve` 回调，也支持直接返回选项数组或其 Promise。

```vue
<script setup lang="ts">
import type { CascaderLazyLoad, CascaderOption } from 'element-like'

const options: CascaderOption[] = [
  { value: 'guide', label: '指南', leaf: true },
  { value: 'component', label: '组件' },
]

const lazyLoad: CascaderLazyLoad = async (node, resolve) => {
  const children = await fetchChildren(node.value)
  resolve(children)
}
</script>

<template>
  <el-like-cascader
    v-model="value"
    :options="options"
    :props="{ lazy: true, lazyLoad }"
    @load-error="handleLoadError"
  />
</template>
```

加载失败会触发 `load-error`，节点保留可重试状态。使用懒加载并传入初始值时，对应路径需已加载，组件才能解析并显示该值。

## 自定义字段与返回值

```vue
<script setup lang="ts">
const options = [
  {
    id: 1,
    name: '一级',
    items: [{ id: 2, name: '二级', unavailable: true }],
  },
]

const config = {
  value: 'id',
  label: 'name',
  children: 'items',
  disabled: 'unavailable',
  emitPath: false,
}
</script>

<template>
  <el-like-cascader v-model="value" :options="options" :props="config" />
</template>
```

`emitPath: false` 时，单选返回节点 `value`，多选返回 `value[]`。同一棵树中建议保证该值唯一。

## 自定义节点内容

默认插槽同时作用于普通菜单和搜索结果，参数包含归一化节点 `node` 与原始数据 `data`。

```vue
<el-like-cascader v-model="value" :options="options">
  <template #default="{ node, data }">
    <span>{{ node.label }}</span>
    <small v-if="data.description">（{{ data.description }}）</small>
  </template>
</el-like-cascader>
```

## Props

| 属性                | 说明                                             | 类型                                                         | 默认值           |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------------ | ---------------- |
| `v-model`           | 选中值；默认单选为路径数组，多选为路径数组的数组 | `CascaderValue`                                              | `null`           |
| `options`           | 层级选项                                         | `CascaderOption[]`                                           | `[]`             |
| `props`             | 节点行为与字段配置，见下表                       | `CascaderConfig`                                             | `{}`             |
| `placeholder`       | 占位文本                                         | `string`                                                     | `请选择`         |
| `disabled`          | 是否禁用整个组件                                 | `boolean`                                                    | `false`          |
| `clearable`         | 是否允许清空                                     | `boolean`                                                    | `false`          |
| `filterable`        | 是否可搜索                                       | `boolean`                                                    | `false`          |
| `filter-method`     | 自定义搜索方法                                   | `(node, keyword) => boolean`                                 | —                |
| `before-filter`     | 搜索前置拦截，支持 Promise                       | `(keyword) => boolean \| Promise<boolean>`                   | —                |
| `debounce`          | 搜索去抖时间（ms）                               | `number`                                                     | `300`            |
| `separator`         | 完整路径分隔符                                   | `string`                                                     | `' / '`          |
| `show-all-levels`   | 输入框和标签是否显示完整路径                     | `boolean`                                                    | `true`           |
| `collapse-tags`     | 多选时是否折叠标签                               | `boolean`                                                    | `false`          |
| `max-collapse-tags` | 折叠前最多展示的标签数                           | `number`                                                     | `1`              |
| `size`              | 尺寸                                             | `'large' \| 'default' \| 'small'`                            | `'default'`      |
| `placement`         | 下拉首选位置                                     | `'top-start' \| 'top-end' \| 'bottom-start' \| 'bottom-end'` | `'bottom-start'` |
| `popper-class`      | 下拉面板自定义类名                               | `string`                                                     | `''`             |
| `teleported`        | 是否挂载到 body                                  | `boolean`                                                    | `true`           |
| `empty-text`        | 无搜索结果文案                                   | `string`                                                     | `无匹配数据`     |
| `no-data-text`      | 无选项文案                                       | `string`                                                     | `无数据`         |
| `loading-text`      | 节点加载状态的无障碍文本                         | `string`                                                     | `加载中`         |
| `aria-label`        | 输入框无障碍名称                                 | `string`                                                     | `级联选择器`     |

### props 配置

| 字段            | 说明                              | 默认值       |
| --------------- | --------------------------------- | ------------ |
| `expandTrigger` | 子菜单展开方式：`click` / `hover` | `'click'`    |
| `multiple`      | 是否多选                          | `false`      |
| `checkStrictly` | 是否允许任意级选择并解除父子联动  | `false`      |
| `emitPath`      | 是否返回完整路径                  | `true`       |
| `lazy`          | 是否懒加载                        | `false`      |
| `lazyLoad`      | 懒加载方法                        | —            |
| `value`         | 节点值字段                        | `'value'`    |
| `label`         | 节点文本字段                      | `'label'`    |
| `children`      | 子节点字段                        | `'children'` |
| `disabled`      | 禁用字段                          | `'disabled'` |
| `leaf`          | 懒加载叶子标记字段                | `'leaf'`     |

## Events

| 事件                | 说明                              | 参数               |
| ------------------- | --------------------------------- | ------------------ |
| `update:modelValue` | 选中值变化，用于 `v-model`        | `CascaderValue`    |
| `change`            | 选中值变化                        | `CascaderValue`    |
| `visible-change`    | 下拉显示状态变化                  | `boolean`          |
| `expand-change`     | 展开的父节点变化                  | 当前节点完整路径   |
| `remove-tag`        | 多选标签被移除                    | 被移除节点的返回值 |
| `clear`             | 清空选择                          | —                  |
| `focus` / `blur`    | 输入框聚焦 / 失焦                 | `FocusEvent`       |
| `load-error`        | 懒加载抛出异常或 Promise rejected | `(error, node)`    |

## 暴露方法

通过模板 ref 调用，类型为 `CascaderExpose`：

- `focus()` / `blur()`：聚焦 / 失焦输入框。
- `toggleDropDownVisible(visible?)`：切换或指定下拉显示状态。
- `updatePopperPosition()`：重新计算下拉位置。
- `getCheckedNodes(leafOnly = false)`：获取当前已解析的选中节点。

## 键盘操作

- 输入框：↓ / Enter 打开，Esc 关闭；多选且输入为空时 Backspace 删除最后一项。
- 菜单节点：Enter 执行点击，Space 选择，↑ / ↓ 移动焦点，→ 展开，← 回到父节点。
- 搜索结果：↑ / ↓ 切换活动项，Enter 选择。
