# VirtualList 虚拟列表

VirtualList 用于渲染超长列表：完整数据保留在 JavaScript 中，DOM 中只创建可视区及上下缓冲区内的行。支持固定或动态行高、稳定 key、高度缓存、滚动定位和渲染范围通知。

- 组件已全局注册，模板中直接使用 `<el-like-virtual-list>`，无需 import
- `items` 保存完整数据或当前已加载的数据，组件不会复制或修改该数组
- `estimatedItemHeight` 只用于首次渲染，可见行随后由 `ResizeObserver` 测量
- `overscan` 是可视区**上下各自**额外渲染的行数，不是总数
- `getKey` 应返回稳定且唯一的字符串或数字，数据会增删、重排时尤其重要

## 基础用法

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

const users: User[] = Array.from({ length: 100_000 }, (_, index) => ({
  id: index + 1,
  name: `用户 ${index + 1}`,
}))

const getUserKey = (user: User) => user.id
</script>

<template>
  <el-like-virtual-list
    :items="users"
    :get-key="getUserKey"
    :estimated-item-height="48"
    :overscan="6"
    :height="480"
  >
    <template #item="{ item, index }">
      <div class="user-row">{{ index + 1 }}. {{ item.name }}</div>
    </template>
  </el-like-virtual-list>
</template>

<style scoped>
.user-row {
  box-sizing: border-box;
  height: 48px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
```

`height` 为数字时按 px 处理，也可以传入 `'480px'`、`'60vh'` 等 CSS 长度。默认值是 `'100%'`，此时必须为父元素提供确定的高度，否则视口无法形成有效的滚动区域。

## 动态行高

行内容由 `#item` 插槽决定，不要求每行等高。可见行初次挂载及尺寸变化时会自动测量，后续行高用于更新总高度、滚动范围和定位结果：

```vue
<el-like-virtual-list :items="articles" :get-key="(article) => article.id" :height="500">
  <template #item="{ item }">
    <article class="article-row">
      <h3>{{ item.title }}</h3>
      <p v-if="item.expanded">{{ item.content }}</p>
    </article>
  </template>
</el-like-virtual-list>
```

注意：

- 行根元素是组件生成的 `.el-like-virtual-list__item`，插槽内容会包含在它的测量高度内。
- 不要给 `.el-like-virtual-list__item` 或最外层插槽元素设置垂直 `margin`；外边距不计入 `borderBoxSize`，且可能在行之间折叠。需要间距时请使用 `padding` 或内部元素。
- 展开、收起、图片加载、字体加载等导致的行高变化会被自动测量。
- 行高变化发生在当前滚动锚点上方时，组件会补偿 `scrollTop`，尽量避免可视内容跳动。

## 滚动定位

通过组件引用调用 `scrollToIndex` 或 `scrollToOffset`：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { VirtualListExpose } from 'element-like'

const listRef = ref<VirtualListExpose>()
const items = Array.from({ length: 100_000 }, (_, id) => ({ id }))

const scrollToMiddle = () => listRef.value?.scrollToIndex(50_000, 'center')
</script>

<template>
  <button type="button" @click="scrollToMiddle">跳到中间</button>
  <el-like-virtual-list ref="listRef" :items="items" :height="480">
    <template #item="{ item }">{{ item.id }}</template>
  </el-like-virtual-list>
</template>
```

`scrollToIndex` 的目标索引会收敛到有效范围；当行高尚未测量时，定位先使用预估值，后续测量完成再校正布局。`scrollToOffset` 会自动限制在可滚动范围内。

## 获取渲染范围

`range-change` 在可视范围或偏移变化时触发，可用于展示状态或按需加载：

```vue
<script setup lang="ts">
import type { VirtualListRange } from 'element-like'

const onRangeChange = (range: VirtualListRange) => {
  console.log(range.startIndex, range.endIndex)
}
</script>

<template>
  <el-like-virtual-list :items="items" :height="480" @range-change="onRangeChange">
    <template #item="{ item }">{{ item }}</template>
  </el-like-virtual-list>
</template>
```

范围包含 overscan；`startIndex` 为闭区间，`endIndex` 为开区间。例如 `{ startIndex: 10, endIndex: 20 }` 表示渲染索引 10 到 19。

## 数据更新与 key

- 数据替换、排序或过滤后应传入新数组。组件监听数组引用、长度、预估行高和 key 函数的变化；不推荐在原数组中按索引替换元素后保持长度不变。
- 始终提供稳定且唯一的 `getKey`。默认使用索引作为 key，仅适合顺序和集合不变的数据；在头部插入或重排时，索引 key 会把旧行高缓存对应到错误的数据。
- 数据减少后，滚动位置会收敛到新的最大滚动范围。
- 组件只虚拟化纵向布局；复杂表格单元格的语义和列对齐需由插槽内容自行实现。

## API

### Attributes

| 属性名              | 说明                         | 类型                                         | 是否必填 | 默认值   |
| ------------------- | ---------------------------- | -------------------------------------------- | -------- | -------- |
| items               | 完整数据或当前已加载的数据   | `readonly T[]`                               | 是       | —        |
| estimatedItemHeight | 未测量行的预估高度，单位 px  | `number`                                     | 否       | `48`     |
| overscan            | 可视区上下各自额外渲染的行数 | `number`                                     | 否       | `6`      |
| getKey              | 返回稳定且唯一的行标识       | `(item: T, index: number) => string\|number` | 否       | 索引     |
| height              | 滚动视口高度；数字按 px 处理 | `string \| number`                           | 否       | `'100%'` |

### Slots

| 插槽名 | 说明         | 作用域参数                                     |
| ------ | ------------ | ---------------------------------------------- |
| item   | 单行渲染内容 | `{ item: T, index: number }`，index 为原始索引 |

### Events

| 事件名       | 说明                         | 回调参数           |
| ------------ | ---------------------------- | ------------------ |
| range-change | 实际渲染范围或偏移变化时触发 | `VirtualListRange` |

### Exposes

| 方法           | 说明                     | 类型                                           |
| -------------- | ------------------------ | ---------------------------------------------- |
| scrollToIndex  | 滚动到指定索引及对齐位置 | `(index: number, align?: ScrollAlign) => void` |
| scrollToOffset | 滚动到指定像素位置       | `(offset: number) => void`                     |

### 公共类型

```ts
import type { ScrollAlign, VirtualListExpose, VirtualListKey, VirtualListRange } from 'element-like'
```

`ScrollAlign` 可选 `'start' | 'center' | 'end'`；`VirtualListRange` 的结构为 `{ startIndex: number; endIndex: number }`。

## 无障碍说明

滚动视口使用 `role="list"` 且可通过键盘聚焦，每行使用 `role="listitem"`。`aria-setsize` 提供完整数据量，`aria-posinset` 提供当前行的原始位置，避免辅助技术把少量 DOM 行误认为完整列表。

## 性能与限制

- 行高更新、偏移查询和索引定位均为 `O(log n)`，初始化或重建为 `O(n)`。
- 滚动事件通过 `requestAnimationFrame` 合并，不要在 `#item` 插槽中执行与行数无关的重型任务。
- 浏览器对单个元素的最大布局高度有限制，超大数据量可能出现滚动精度或高度上限问题；此时应结合后端游标分页或分片加载。
- `ResizeObserver` 仅观察已渲染行；未渲染行在第一次进入缓冲区前始终使用预估高度。

算法、测量和锚点补偿的详细说明见 [实现文档](./IMPLEMENTATION.md)。
