/**
 * 使用树状数组维护行高及其前缀和。
 * 高度更新、偏移查询和按偏移查找行号均为 O(log n)。
 */
export class Virtualizer {
  private heights = new Float64Array(0)
  private tree = new Float64Array(0)
  private highestBit = 0
  private total = 0

  get count(): number {
    return this.heights.length
  }

  get totalHeight(): number {
    return this.total
  }

  rebuild(heights: ArrayLike<number>): void {
    const count = heights.length
    this.heights = new Float64Array(count)
    this.tree = new Float64Array(count + 1)
    this.highestBit = count > 0 ? 2 ** Math.floor(Math.log2(count)) : 0

    for (let index = 0; index < count; index += 1) {
      this.heights[index] = this.normalizeHeight(heights[index])
    }

    // 线性建树，避免逐行执行 O(log n) 更新
    for (let index = 1; index <= count; index += 1) {
      this.tree[index] = (this.tree[index] ?? 0) + (this.heights[index - 1] ?? 0)
      const parent = index + (index & -index)
      if (parent <= count) {
        this.tree[parent] = (this.tree[parent] ?? 0) + (this.tree[index] ?? 0)
      }
    }

    this.total = this.prefixSum(count)
  }

  getHeight(index: number): number {
    return this.heights[index] ?? 0
  }

  updateHeight(index: number, height: number): boolean {
    if (!Number.isInteger(index) || index < 0 || index >= this.count) return false

    const nextHeight = this.normalizeHeight(height)
    const previousHeight = this.heights[index] ?? 0
    const delta = nextHeight - previousHeight

    // 忽略亚像素误差，避免 ResizeObserver 测量与更新形成反馈循环
    if (Math.abs(delta) < 0.5) return false

    this.heights[index] = nextHeight
    this.total += delta

    for (let treeIndex = index + 1; treeIndex <= this.count; treeIndex += treeIndex & -treeIndex) {
      this.tree[treeIndex] = (this.tree[treeIndex] ?? 0) + delta
    }

    return true
  }

  /** 返回指定行顶部的纵向偏移 */
  offsetAt(index: number): number {
    if (index <= 0) return 0
    if (index >= this.count) return this.total
    return this.prefixSum(index)
  }

  /** 返回占据指定纵向偏移的行号 */
  indexAt(offset: number): number {
    if (this.count === 0) return 0

    const target = Math.max(0, Math.min(offset, this.total))
    let index = 0
    let prefix = 0

    // 二进制倍增查找最大的、不超过 target 的前缀和
    for (let bit = this.highestBit; bit > 0; bit = Math.floor(bit / 2)) {
      const next = index + bit
      const nextPrefix = prefix + (this.tree[next] ?? 0)
      if (next <= this.count && nextPrefix <= target) {
        index = next
        prefix = nextPrefix
      }
    }

    return Math.min(index, this.count - 1)
  }

  private prefixSum(end: number): number {
    let sum = 0
    for (let index = end; index > 0; index -= index & -index) {
      sum += this.tree[index] ?? 0
    }
    return sum
  }

  private normalizeHeight(height: number | undefined): number {
    return height !== undefined && Number.isFinite(height) && height > 0 ? height : 1
  }
}
