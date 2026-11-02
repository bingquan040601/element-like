# VirtualList 实现文档

本文面向组件维护者，说明 VirtualList 的虚拟化算法、DOM 结构、动态测量和滚动补偿。使用方式与 API 见 [README.md](./README.md)。

## 文件职责

| 文件                                                           | 职责                                             |
| -------------------------------------------------------------- | ------------------------------------------------ |
| [VirtualList.vue](./VirtualList.vue)                           | 组件状态、渲染窗口、DOM 测量、滚动控制及生命周期 |
| [virtualizer.ts](./virtualizer.ts)                             | 与 Vue 无关的行高前缀和数据结构，可独立测试      |
| [types.ts](./types.ts)                                         | key、滚动对齐、渲染范围和组件暴露方法的公共类型  |
| [index.ts](./index.ts)                                         | `withInstall` 按需安装入口及公共导出             |
| [virtual-list.scss](../../styles/components/virtual-list.scss) | 视口、占位层、渲染层与行元素的布局样式           |
| [VirtualListView.vue](../../views/VirtualListView.vue)         | 10 万条订单数据与动态行高的交互示例              |

## 核心思路

长列表的性能问题不是 JavaScript 数组本身，而是为所有数据创建、布局和更新 DOM。VirtualList 将问题拆成两部分：

1. 用所有行的**高度模型**计算完整滚动长度和当前应显示的行号。
2. 只为当前行号窗口创建 DOM，其余区域用一个空白占位层表示。

因此，数据量为 10 万时，实际 DOM 行数仍只取决于视口高度、行高和 overscan。

## DOM 与坐标系

```text
.el-like-virtual-list                 滚动视口，产生 scrollTop
└── .el-like-virtual-list__spacer     height = totalHeight，撑开滚动条
    └── .el-like-virtual-list__content
        ├── .el-like-virtual-list__item[data-index="..."]
        ├── .el-like-virtual-list__item[data-index="..."]
        └── ...
```

- **spacer**：高度等于所有行的估算/实测高度之和，让浏览器产生正确的滚动范围。
- **content**：绝对定位在 spacer 顶部，通过 `translateY(renderOffset)` 移到第一个渲染行的位置。
- **item**：保留原始 `data-index`，测量时据此更新高度模型；`aria-posinset` 同样使用原始索引。

`renderOffset` 是第一个渲染行之前所有行的高度之和，而不是 `scrollTop`。因为 overscan 会让第一行位于可视区上方，两者通常不相等。

使用 `transform` 移动 content 不改变文档布局；spacer 始终负责完整高度。视口的 `contain: strict` 限制内部布局、绘制对外部的影响，`will-change: transform` 提示浏览器优化滚动时的合成。

## 树状数组高度模型

直接保存 `heights[]` 时，修改一行高度是 `O(1)`，但每次查询前面所有行的高度之和是 `O(n)`；直接保存前缀和则相反，修改一行后需要重写后续所有前缀和。Virtualizer 使用**树状数组（Fenwick Tree）**平衡两类操作。

### 存储结构

- `heights`：每行的实际高度，使用 `Float64Array` 降低大数据量下的内存占用。
- `tree`：长度为 `count + 1` 的一基索引树状数组。
- `total`：完整高度缓存，读取总高度无需重复查询。
- `highestBit`：不超过 `count` 的最大 2 的幂，供二分倍增查询使用。

树节点 `tree[i]` 管理的区间长度由最低有效位 `i & -i` 决定。前缀查询不断移除最低有效位，单点更新不断向父节点累加：

```ts
// 查询 heights[0..end)
for (let index = end; index > 0; index -= index & -index) {
  sum += tree[index]
}

// 更新 heights[index] 的差值 delta
for (let i = index + 1; i <= count; i += i & -i) {
  tree[i] += delta
}
```

初始化通过线性建树一次完成，不逐行调用更新：

```text
heights = [10, 20, 30, 40]
offsetAt(0) = 0
offsetAt(1) = 10
offsetAt(2) = 30
offsetAt(3) = 60
totalHeight = 100
```

### 操作复杂度

| 操作                        | 实现                 | 时间复杂度 |
| --------------------------- | -------------------- | ---------- |
| `rebuild`                   | 线性建树             | `O(n)`     |
| `updateHeight`              | 更新受影响的树节点   | `O(log n)` |
| `offsetAt`                  | 前缀和查询           | `O(log n)` |
| `indexAt`                   | 在树状数组上二分倍增 | `O(log n)` |
| `getHeight` / `totalHeight` | 直接读取             | `O(1)`     |

`indexAt(offset)` 找到满足“前缀和不超过 offset”的最大边界，再收敛到最后一行。offset 恰好等于某行结束位置时返回下一行，这与连续滚动坐标一致；offset 等于总高度时返回最后一行，便于计算列表尾部范围。

高度为 0、负数、NaN 或 Infinity 时归一化为 1px；高度差小于 0.5px 时忽略，降低浏览器亚像素测量引起的观察器反馈循环。

## 渲染窗口计算

每次滚动或尺寸变化后执行 `updateRange`：

```text
visibleStart = indexAt(scrollTop)
visibleEnd   = indexAt(scrollTop + max(clientHeight, 1)) + 1
startIndex   = max(0, visibleStart - overscan)
endIndex     = min(itemCount, visibleEnd + overscan)
renderOffset = offsetAt(startIndex)
```

其中 `visibleEnd` 和 `endIndex` 都是开区间。随后仅遍历 `[startIndex, endIndex)` 创建 `visibleItems`。

组件缓存上次的范围与偏移；三者均未变化时不替换 `visibleItems`，避免不必要的 Vue 更新。`visibleItems` 使用 `shallowRef`，因为窗口变化时整体替换数组，无需深度追踪每行对象。

滚动事件不直接计算窗口，而是通过 `requestAnimationFrame` 合并：

```text
多个 scroll 事件 → 只登记一个 frameId → 下一帧 updateRange → 清除 frameId
```

卸载时取消未执行的帧，防止回调访问已销毁组件。

## 动态行高测量

### 观察已渲染行

`onMounted` 创建一个 `ResizeObserver`，同时观察视口和当前渲染行。`onUpdated` 调用 `syncObservedItems`：

1. 收集 content 下带有 `data-index` 的新 DOM 行。
2. 观察新加入的行。
3. 取消观察离开渲染窗口的行。
4. 卸载时统一 `disconnect`。

行高优先读取 `entry.borderBoxSize[0].blockSize`，包含内容、padding 和 border；不包含 margin。不可用时回退到 `offsetHeight`。

### 高度缓存

`sizeCache` 使用 `Map<VirtualListKey, number>` 按业务 key 保存实测高度。数据数组或预估高度变化时，`rebuildVirtualizer` 为所有行重建高度数组：

```text
height[i] = sizeCache.get(getKey(items[i], i)) ?? estimatedItemHeight
```

已测量过的行即使离开窗口后再次进入，也不必从预估高度重新开始。稳定且唯一的 key 是缓存正确性的前提；默认索引 key 在插入、删除或排序时无法保持数据身份。

## 滚动锚点补偿

动态列表常见的跳动来自当前视口上方的行高变化：上方内容变高后，原内容会被向下推，但 `scrollTop` 没有变化。

测量回调开始处理前，先记录锚点：

```text
anchorIndex = indexAt(scrollTop)
anchorShift = 0
```

对每个实际高度发生变化的行：

```text
delta = nextHeight - previousHeight
如果 index < anchorIndex：anchorShift += delta
```

整批处理完成后：

```text
scrollTop += anchorShift
totalHeight = virtualizer.totalHeight
scheduleRangeUpdate()
```

这样，锚点及其后的内容在视觉上保持原位置。批量累加后只写一次 `scrollTop`，避免逐行修改造成多次滚动。

## 初始化与更新流程

```text
props.items / estimatedItemHeight / getKey 变化
                    ↓
          读取 sizeCache 并 rebuild
                    ↓
       更新 totalHeight，清空旧窗口缓存
                    ↓
      数据减少时收敛越界的 scrollTop（如有）
                    ↓
               updateRange
                    ↓
       Vue 渲染 visibleItems 对应 DOM
                    ↓
       syncObservedItems → ResizeObserver
                    ↓
       实测高度、缓存、锚点补偿与窗口更新
```

watch 使用 `flush: 'post'`，确保 DOM 更新后再基于最新状态计算；`onMounted` 再主动计算一次，覆盖首次挂载。

## 滚动定位

`scrollToIndex(index, align)` 先将索引限制到 `[0, count - 1]`，再读取该行的 `offsetAt` 和高度：

```text
start:  offset = itemOffset
center: offset = itemOffset - (clientHeight - itemHeight) / 2
end:    offset = itemOffset - (clientHeight - itemHeight)
```

最终统一经过 `scrollToOffset`，将结果限制到 `[0, totalHeight - clientHeight]`。调用后主动更新一次范围，不依赖尚未派发的 scroll 事件。

定位到尚未测量的远端行时使用的是预估高度；随着目标附近的行被测量，总高度和位置会逐步精确。因此“任意动态高度列表中的绝对像素定位”在首次访问时天然带有预估误差。

## 测试分层

- `virtualizer.spec.ts`：不依赖 DOM，验证前缀和、边界索引、动态更新、非法高度和大量更新结果。
- `VirtualList.spec.ts`：模拟 `ResizeObserver`、`requestAnimationFrame` 和视口高度，验证窗口渲染、滚动合帧、锚点补偿、定位、key 缓存及清理逻辑。
- `VirtualListView.vue`：提供真实浏览器中的大数据量、动态内容和交互回归入口。

## 已知边界

- 只支持纵向列表，不支持横向或二维网格虚拟化。
- 不观察未渲染行；其内容在数据层发生变化不会影响高度，直到进入渲染窗口。
- 不支持行根元素的垂直 margin 测量。
- 原数组中按索引替换元素且长度不变不会触发重建，应传入新数组。
- 浏览器最大布局高度会限制超大数据量；应结合分页或分片加载。
