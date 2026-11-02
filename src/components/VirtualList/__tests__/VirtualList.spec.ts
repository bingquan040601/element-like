import { h, nextTick } from 'vue'
import type { DefineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VirtualList from '../VirtualList.vue'
import type { VirtualListExpose } from '../types'

interface Row {
  id: number
  label: string
}

// 将泛型 SFC 固定为测试数据类型，保留 setProps 等测试 API 的类型检查
const TestVirtualList = VirtualList as unknown as DefineComponent<{
  items: readonly Row[]
  estimatedItemHeight?: number
  overscan?: number
  height?: string | number
  getKey?: (item: Row, index: number) => string | number
}>

class ResizeObserverMock {
  static instances: ResizeObserverMock[] = []

  readonly observed = new Set<Element>()
  readonly disconnect = vi.fn<() => void>(() => this.observed.clear())
  private readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    ResizeObserverMock.instances.push(this)
  }

  observe(target: Element): void {
    this.observed.add(target)
  }

  unobserve(target: Element): void {
    this.observed.delete(target)
  }

  emit(entries: ResizeObserverEntry[]): void {
    this.callback(entries, this as unknown as ResizeObserver)
  }
}

const rows: Row[] = Array.from({ length: 1_000 }, (_, index) => ({
  id: index + 1,
  label: `Row ${index + 1}`,
}))

let frameCallbacks: Map<number, FrameRequestCallback>
let nextFrameId: number

const getObserver = (): ResizeObserverMock => {
  const observer = ResizeObserverMock.instances[0]
  if (!observer) throw new Error('ResizeObserver was not created')
  return observer
}

const createResizeEntry = (target: Element, height: number): ResizeObserverEntry =>
  ({
    target,
    borderBoxSize: [{ blockSize: height, inlineSize: 100 }],
  }) as unknown as ResizeObserverEntry

const flushFrame = async (): Promise<void> => {
  const callbacks = [...frameCallbacks.values()]
  frameCallbacks.clear()
  callbacks.forEach((callback) => callback(0))
  await nextTick()
}

const getRenderedIndexes = (wrapper: ReturnType<typeof mount>): number[] =>
  wrapper
    .findAll('.el-like-virtual-list__item')
    .map((element) => Number(element.attributes('data-index')))

const getLastRange = (wrapper: ReturnType<typeof mount>): unknown => {
  const events = wrapper.emitted('rangeChange')
  return events?.[events.length - 1]?.[0]
}

const mountList = async () => {
  const wrapper = mount(TestVirtualList, {
    props: {
      items: rows,
      estimatedItemHeight: 20,
      overscan: 1,
      height: 300,
      getKey: (item: unknown) => (item as Row).id,
    },
    slots: {
      item: ({ item, index }: { item: unknown; index: number }) =>
        h('span', { class: 'row-content' }, `${index}:${(item as Row).label}`),
    },
  })
  await nextTick()
  return wrapper
}

describe('ElLike-VirtualList', () => {
  beforeEach(() => {
    ResizeObserverMock.instances = []
    frameCallbacks = new Map()
    nextFrameId = 0
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      nextFrameId += 1
      frameCallbacks.set(nextFrameId, callback)
      return nextFrameId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frameCallbacks.delete(id))
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return this.classList.contains('el-like-virtual-list') ? 100 : 0
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders only the viewport and overscan rows with a full-height spacer', async () => {
    const wrapper = await mountList()

    expect(wrapper.attributes('role')).toBe('list')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('style')).toContain('height: 300px')
    expect(wrapper.find('.el-like-virtual-list__spacer').attributes('style')).toContain(
      'height: 20000px',
    )
    expect(getRenderedIndexes(wrapper)).toEqual([0, 1, 2, 3, 4, 5, 6])
    expect(wrapper.find('.row-content').text()).toBe('0:Row 1')
    expect(getLastRange(wrapper)).toEqual({ startIndex: 0, endIndex: 7 })
    expect(getObserver().observed.size).toBe(8)
  })

  it('coalesces scroll events into one animation frame and updates the rendered range', async () => {
    const wrapper = await mountList()
    const viewport = wrapper.find('.el-like-virtual-list')
    viewport.element.scrollTop = 400

    await viewport.trigger('scroll')
    await viewport.trigger('scroll')
    expect(frameCallbacks.size).toBe(1)

    await flushFrame()
    expect(getRenderedIndexes(wrapper)).toEqual([19, 20, 21, 22, 23, 24, 25, 26])
    expect(wrapper.find('.el-like-virtual-list__content').attributes('style')).toContain(
      'translateY(380px)',
    )
    expect(getLastRange(wrapper)).toEqual({ startIndex: 19, endIndex: 27 })
  })

  it('compensates scrollTop when a row above the anchor changes height', async () => {
    const wrapper = await mountList()
    const viewport = wrapper.find('.el-like-virtual-list')
    viewport.element.scrollTop = 400
    await viewport.trigger('scroll')
    await flushFrame()

    const rowAboveAnchor = wrapper.find('[data-index="19"]')
    getObserver().emit([createResizeEntry(rowAboveAnchor.element, 40)])
    await nextTick()

    expect(viewport.element.scrollTop).toBe(420)
    expect(wrapper.find('.el-like-virtual-list__spacer').attributes('style')).toContain(
      'height: 20020px',
    )

    await flushFrame()
    expect(wrapper.find('.el-like-virtual-list__content').attributes('style')).toContain(
      'translateY(380px)',
    )
  })

  it('scrolls to an index with alignment and clamps offsets to the scrollable area', async () => {
    const wrapper = await mountList()
    const viewport = wrapper.find('.el-like-virtual-list')
    const scrollTo = vi.fn<(options: ScrollToOptions) => void>((options) => {
      viewport.element.scrollTop = options.top ?? 0
    })
    Object.defineProperty(viewport.element, 'scrollTo', { configurable: true, value: scrollTo })
    const exposed = wrapper.vm as unknown as VirtualListExpose

    exposed.scrollToIndex(50, 'center')
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 960, behavior: 'auto' })
    await nextTick()
    expect(getRenderedIndexes(wrapper)).toContain(50)

    exposed.scrollToOffset(50_000)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 19_900, behavior: 'auto' })

    exposed.scrollToOffset(-100)
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'auto' })
  })

  it('retains measured heights by key when the items array is replaced', async () => {
    const wrapper = await mountList()
    const firstRow = wrapper.find('[data-index="0"]')
    getObserver().emit([createResizeEntry(firstRow.element, 40)])
    await nextTick()

    const nextRows = rows.map((row) => (row.id === 1 ? { ...row, label: 'Updated row' } : row))
    await wrapper.setProps({ items: nextRows })
    await nextTick()

    expect(wrapper.find('.row-content').text()).toBe('0:Updated row')
    expect(wrapper.find('.el-like-virtual-list__spacer').attributes('style')).toContain(
      'height: 20020px',
    )
  })

  it('clears rendered rows when the data becomes empty', async () => {
    const wrapper = await mountList()

    await wrapper.setProps({ items: [] })
    await nextTick()

    expect(getRenderedIndexes(wrapper)).toEqual([])
    expect(wrapper.find('.el-like-virtual-list__spacer').attributes('style')).toContain(
      'height: 0px',
    )
  })

  it('disconnects the resize observer on unmount', async () => {
    const wrapper = await mountList()
    const observer = getObserver()

    wrapper.unmount()

    expect(observer.disconnect).toHaveBeenCalledOnce()
  })
})
