<script setup lang="ts" generic="T">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { Virtualizer } from './virtualizer'
import type { ScrollAlign, VirtualListKey, VirtualListRange } from './types'

interface VisibleItem<U> {
  item: U
  index: number
  key: VirtualListKey
}

defineOptions({
  name: 'ElLike-VirtualList',
})

const props = withDefaults(
  defineProps<{
    items: readonly T[]
    /** 行尚未测量时使用的预估高度，无需与实际高度完全一致 */
    estimatedItemHeight?: number
    /** 可视区上下各自额外渲染的行数 */
    overscan?: number
    /** 返回稳定且唯一的 key，用于在数据更新后保留行高缓存 */
    getKey?: (item: T, index: number) => VirtualListKey
    /** 滚动视口高度；数字按 px 处理 */
    height?: string | number
  }>(),
  {
    estimatedItemHeight: 48,
    overscan: 6,
    height: '100%',
    getKey: undefined,
  },
)

const emit = defineEmits<{
  /** 范围包含 overscan，startIndex 为闭区间，endIndex 为开区间 */
  rangeChange: [range: VirtualListRange]
}>()

const viewportRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const visibleItems = shallowRef<VisibleItem<T>[]>([])
const renderOffset = ref(0)
const totalHeight = ref(0)
const virtualizer = new Virtualizer()
const sizeCache = new Map<VirtualListKey, number>()
const observedItems = new Set<HTMLElement>()

let resizeObserver: ResizeObserver | undefined
let frameId: number | undefined
let previousRange: VirtualListRange = { startIndex: -1, endIndex: -1 }
let previousOffset = -1

const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}))

function getItemKey(item: T, index: number): VirtualListKey {
  return props.getKey?.(item, index) ?? index
}

function updateRange(): void {
  const viewport = viewportRef.value
  const count = props.items.length

  if (!viewport || count === 0) {
    visibleItems.value = []
    renderOffset.value = 0
    previousRange = { startIndex: -1, endIndex: -1 }
    previousOffset = -1
    return
  }

  const viewportHeight = viewport.clientHeight
  const visibleStart = virtualizer.indexAt(viewport.scrollTop)
  const visibleEnd = virtualizer.indexAt(viewport.scrollTop + Math.max(viewportHeight, 1)) + 1
  // 非法值不进入索引计算；负数按 0 处理，小数直接截断
  const overscan = Number.isFinite(props.overscan) ? Math.max(0, Math.floor(props.overscan)) : 0
  const startIndex = Math.max(0, visibleStart - overscan)
  const endIndex = Math.min(count, visibleEnd + overscan)
  const offset = virtualizer.offsetAt(startIndex)

  if (
    previousRange.startIndex === startIndex &&
    previousRange.endIndex === endIndex &&
    previousOffset === offset
  ) {
    return
  }

  const nextItems: VisibleItem<T>[] = []
  for (let index = startIndex; index < endIndex; index += 1) {
    const item = props.items[index]
    if (item !== undefined || index in props.items) {
      nextItems.push({ item: item as T, index, key: getItemKey(item as T, index) })
    }
  }

  visibleItems.value = nextItems
  renderOffset.value = offset
  previousRange = { startIndex, endIndex }
  previousOffset = offset
  emit('rangeChange', previousRange)
}

function scheduleRangeUpdate(): void {
  if (frameId !== undefined) return
  frameId = requestAnimationFrame(() => {
    frameId = undefined
    updateRange()
  })
}

function rebuildVirtualizer(): void {
  const heights = new Float64Array(props.items.length)

  for (let index = 0; index < props.items.length; index += 1) {
    const item = props.items[index] as T
    heights[index] = sizeCache.get(getItemKey(item, index)) ?? props.estimatedItemHeight
  }

  virtualizer.rebuild(heights)
  totalHeight.value = virtualizer.totalHeight
  previousRange = { startIndex: -1, endIndex: -1 }
  previousOffset = -1

  // 数据量减少时同步收敛滚动位置，避免旧 scrollTop 落在新的列表范围之外
  const viewport = viewportRef.value
  if (viewport) {
    const maxOffset = Math.max(0, virtualizer.totalHeight - viewport.clientHeight)
    viewport.scrollTop = Math.min(viewport.scrollTop, maxOffset)
  }
  updateRange()
}

function measureItem(entry: ResizeObserverEntry): number {
  const borderBox = entry.borderBoxSize[0]
  return borderBox?.blockSize ?? (entry.target as HTMLElement).offsetHeight
}

function handleResize(entries: ResizeObserverEntry[]): void {
  const viewport = viewportRef.value
  if (!viewport) return

  let itemsChanged = false
  let viewportChanged = false
  const anchorIndex = virtualizer.indexAt(viewport.scrollTop)
  let anchorShift = 0

  for (const entry of entries) {
    if (entry.target === viewport) {
      viewportChanged = true
      continue
    }

    const element = entry.target as HTMLElement
    const index = Number(element.dataset.index)
    if (!Number.isInteger(index) || index < 0 || index >= props.items.length) continue

    const previousHeight = virtualizer.getHeight(index)
    if (!virtualizer.updateHeight(index, measureItem(entry))) continue

    const item = props.items[index] as T
    const nextHeight = virtualizer.getHeight(index)
    sizeCache.set(getItemKey(item, index), nextHeight)
    itemsChanged = true

    // 锚点上方行高变化时同步补偿 scrollTop，防止可视内容上下跳动
    if (index < anchorIndex) anchorShift += nextHeight - previousHeight
  }

  if (itemsChanged) totalHeight.value = virtualizer.totalHeight
  if (anchorShift !== 0) viewport.scrollTop += anchorShift
  if (itemsChanged || viewportChanged) scheduleRangeUpdate()
}

function syncObservedItems(): void {
  if (!resizeObserver || !contentRef.value) return

  const nextItems = new Set<HTMLElement>()
  for (const child of contentRef.value.children) {
    if (child instanceof HTMLElement && child.dataset.index !== undefined) {
      nextItems.add(child)
      if (!observedItems.has(child)) resizeObserver.observe(child)
    }
  }

  for (const element of observedItems) {
    if (!nextItems.has(element)) resizeObserver.unobserve(element)
  }

  observedItems.clear()
  for (const element of nextItems) observedItems.add(element)
}

function scrollToOffset(offset: number): void {
  const viewport = viewportRef.value
  if (!viewport) return

  const maxOffset = Math.max(0, virtualizer.totalHeight - viewport.clientHeight)
  viewport.scrollTo({ top: Math.max(0, Math.min(offset, maxOffset)), behavior: 'auto' })
  updateRange()
}

function scrollToIndex(index: number, align: ScrollAlign = 'start'): void {
  const viewport = viewportRef.value
  if (!viewport || virtualizer.count === 0) return

  const targetIndex = Math.max(0, Math.min(Math.floor(index), virtualizer.count - 1))
  const itemOffset = virtualizer.offsetAt(targetIndex)
  const itemHeight = virtualizer.getHeight(targetIndex)
  let offset = itemOffset

  if (align === 'center') offset -= (viewport.clientHeight - itemHeight) / 2
  if (align === 'end') offset -= viewport.clientHeight - itemHeight

  scrollToOffset(offset)
}

watch(
  () => [props.items, props.items.length, props.estimatedItemHeight, props.getKey] as const,
  rebuildVirtualizer,
  { immediate: true, flush: 'post' },
)
watch(() => props.overscan, scheduleRangeUpdate)

onMounted(() => {
  resizeObserver = new ResizeObserver(handleResize)
  if (viewportRef.value) resizeObserver.observe(viewportRef.value)
  updateRange()
  void nextTick(syncObservedItems)
})
onUpdated(syncObservedItems)

onBeforeUnmount(() => {
  if (frameId !== undefined) cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  observedItems.clear()
})

defineExpose({ scrollToIndex, scrollToOffset })
</script>

<template>
  <div
    ref="viewportRef"
    class="el-like-virtual-list"
    role="list"
    tabindex="0"
    :style="containerStyle"
    @scroll.passive="scheduleRangeUpdate"
  >
    <div class="el-like-virtual-list__spacer" :style="{ height: `${totalHeight}px` }">
      <div
        ref="contentRef"
        class="el-like-virtual-list__content"
        :style="{ transform: `translateY(${renderOffset}px)` }"
      >
        <div
          v-for="entry in visibleItems"
          :key="entry.key"
          class="el-like-virtual-list__item"
          role="listitem"
          :data-index="entry.index"
          :aria-setsize="items.length"
          :aria-posinset="entry.index + 1"
        >
          <slot name="item" :item="entry.item" :index="entry.index" />
        </div>
      </div>
    </div>
  </div>
</template>
