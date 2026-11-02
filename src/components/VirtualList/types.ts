export type VirtualListKey = string | number
export type ScrollAlign = 'start' | 'center' | 'end'

/** 当前渲染范围，包含 overscan；endIndex 不包含在范围内 */
export interface VirtualListRange {
  startIndex: number
  endIndex: number
}

export interface VirtualListExpose {
  scrollToIndex: (index: number, align?: ScrollAlign) => void
  scrollToOffset: (offset: number) => void
}
