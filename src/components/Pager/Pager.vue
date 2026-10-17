<template>
  <nav
    class="el-like-pager"
    :class="[
      type ? `el-like-pager--${type}` : '',
      size && size !== 'default' ? `el-like-pager--${size}` : '',
    ]"
    aria-label="分页导航"
  >
    <ul class="el-like-pager__list">
      <li v-for="item in pagerItems" :key="item.key" class="el-like-pager__item">
        <button
          v-if="item.kind === 'page'"
          class="el-like-pager__button el-like-pager__page"
          :class="{ 'is-active': item.page === activePage }"
          type="button"
          :aria-label="`第 ${item.page} 页`"
          :aria-current="item.page === activePage ? 'page' : undefined"
          @click="changePage(item.page)"
        >
          {{ item.page }}
        </button>
        <button
          v-else
          class="el-like-pager__button el-like-pager__ellipsis"
          :class="`el-like-pager__ellipsis--${item.direction}`"
          type="button"
          :aria-label="`${item.direction === 'previous' ? '向前' : '向后'}跳转到第 ${item.target} 页`"
          @click="changePage(item.target)"
        >
          <span aria-hidden="true">&hellip;</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { pagerProps } from './props'

defineOptions({
  name: 'ElLike-Pager',
})

type PagerDirection = 'previous' | 'next'
type PagerItem =
  | { kind: 'page'; key: string; page: number }
  | { kind: 'ellipsis'; key: string; direction: PagerDirection; target: number }

const props = defineProps(pagerProps)
const emit = defineEmits<{
  'current-change': [page: number]
}>()

// 对异常数值做归一化，避免 NaN、Infinity 或小数破坏页码窗口计算
const toInteger = (value: number, fallback: number) =>
  Number.isFinite(value) ? Math.trunc(value) : fallback

const totalPages = computed(() => Math.max(0, toInteger(props.total, 0)))
const visiblePageCount = computed(() => Math.max(1, toInteger(props.pageCount, 10)))

// Pager 是受控组件：越界 currentPage 只影响展示，不主动派发事件修改父组件状态
const activePage = computed(() => {
  if (totalPages.value === 0) return 1
  return Math.min(Math.max(toInteger(props.currentPage, 1), 1), totalPages.value)
})

const createRange = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index)

const visiblePages = computed<number[]>(() => {
  const total = totalPages.value
  if (total === 0) return []

  const limit = Math.min(visiblePageCount.value, total)
  if (limit === total) return createRange(1, total)

  // 极小窗口优先保证当前页可见；省略号负责衔接未展示的首尾区间
  if (limit < 3) {
    const start = Math.min(
      Math.max(activePage.value - Math.floor((limit - 1) / 2), 1),
      total - limit + 1,
    )
    return createRange(start, start + limit - 1)
  }

  // 常规窗口始终保留首页和尾页，中间连续页码围绕当前页居中
  const innerCount = limit - 2
  const centeredPage = Math.min(Math.max(activePage.value, 2), total - 1)
  const maxStart = total - innerCount
  const start = Math.min(Math.max(centeredPage - Math.floor((innerCount - 1) / 2), 2), maxStart)

  return [1, ...createRange(start, start + innerCount - 1), total]
})

const pagerItems = computed<PagerItem[]>(() => {
  const items: PagerItem[] = []
  const pages = visiblePages.value
  const firstPage = pages[0]
  const lastPage = pages[pages.length - 1]

  const createEllipsis = (direction: PagerDirection): PagerItem => ({
    kind: 'ellipsis',
    key: `ellipsis-${direction}`,
    direction,
    target:
      direction === 'previous'
        ? Math.max(1, activePage.value - visiblePageCount.value)
        : Math.min(totalPages.value, activePage.value + visiblePageCount.value),
  })

  if (firstPage !== undefined && firstPage > 1) items.push(createEllipsis('previous'))

  let previousPage: number | undefined
  for (const page of pages) {
    if (previousPage !== undefined && page - previousPage > 1) {
      items.push(createEllipsis(page <= activePage.value ? 'previous' : 'next'))
    }
    items.push({ kind: 'page', key: `page-${page}`, page })
    previousPage = page
  }

  if (lastPage !== undefined && lastPage < totalPages.value) items.push(createEllipsis('next'))

  return items
})

const changePage = (page: number) => {
  if (totalPages.value === 0) return
  const nextPage = Math.min(Math.max(page, 1), totalPages.value)
  if (nextPage === activePage.value) return
  emit('current-change', nextPage)
}
</script>

<style lang="scss" scoped>
/* 组件样式统一维护在 styles/components/pager.scss，与其他组件共享全局 token 体系 */
</style>
