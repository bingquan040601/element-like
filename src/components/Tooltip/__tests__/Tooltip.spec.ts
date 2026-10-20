import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Tooltip from '../Tooltip.vue'

// 与 defineExpose 暴露的方法签名保持一致，便于在测试中类型安全地调用实例方法
interface TooltipInstance {
  open: () => void
  close: () => void
  toggle: () => void
}

const mountTooltip = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(Tooltip, {
    props,
    slots: { default: '<button type="button">触发按钮</button>', ...slots },
    global: {
      stubs: { teleport: true },
    },
  })

const getTrigger = (wrapper: VueWrapper) => wrapper.find('.el-like-tooltip__trigger')
const getPopper = (wrapper: VueWrapper) => wrapper.find('.el-like-tooltip')
const getInstance = (wrapper: VueWrapper) => wrapper.vm as unknown as TooltipInstance

describe('ElLike-Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the trigger slot and keeps the popper hidden with spec defaults', () => {
    const wrapper = mountTooltip()

    expect(getTrigger(wrapper).text()).toBe('触发按钮')
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.props('content')).toBe('')
    expect(wrapper.props('trigger')).toBe('hover')
    expect(wrapper.props('placement')).toBe('left')
    expect(wrapper.props('manual')).toBe(false)
    expect(wrapper.props('openDelay')).toBe(100)
    expect(wrapper.props('closeDelay')).toBe(100)
    expect(wrapper.props('visible')).toBeUndefined()
    expect(wrapper.emitted()).toEqual({})
  })

  it('opens after openDelay on hover and closes after closeDelay on leave', async () => {
    const wrapper = mountTooltip()

    await getTrigger(wrapper).trigger('mouseenter')
    vi.advanceTimersByTime(99)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('visible-change')).toEqual([[true]])

    await getTrigger(wrapper).trigger('mouseleave')
    vi.advanceTimersByTime(99)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    vi.advanceTimersByTime(1)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]])
  })

  it('cancels the pending open when the pointer leaves before openDelay', async () => {
    const wrapper = mountTooltip()

    await getTrigger(wrapper).trigger('mouseenter')
    vi.advanceTimersByTime(50)
    await getTrigger(wrapper).trigger('mouseleave')
    vi.advanceTimersByTime(300)
    await nextTick()

    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted()).toEqual({})
  })

  it('opens and closes immediately when delays are 0', async () => {
    const wrapper = mountTooltip({ openDelay: 0, closeDelay: 0 })

    await getTrigger(wrapper).trigger('mouseenter')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    await getTrigger(wrapper).trigger('mouseleave')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('stays open while the pointer moves onto the popper', async () => {
    const wrapper = mountTooltip()

    await getTrigger(wrapper).trigger('mouseenter')
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    // 离开触发元素后关闭延时已启动，移入气泡将其取消
    await getTrigger(wrapper).trigger('mouseleave')
    vi.advanceTimersByTime(50)
    await getPopper(wrapper).trigger('mouseenter')
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    await getPopper(wrapper).trigger('mouseleave')
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('toggles on click and closes when clicking outside', async () => {
    const wrapper = mountTooltip({ trigger: 'click' })
    const button = wrapper.find('button')

    await button.trigger('click')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    await button.trigger('click')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)

    await button.trigger('click')
    await nextTick()
    document.body.click()
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false], [true], [false]])
  })

  it('opens on focus and closes on blur for the focus trigger', async () => {
    const wrapper = mountTooltip({ trigger: 'focus' })

    await getTrigger(wrapper).trigger('focusin')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    await getTrigger(wrapper).trigger('focusout')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('ignores trigger interactions in manual mode and exposes open/close methods', async () => {
    const wrapper = mountTooltip({ manual: true })

    await getTrigger(wrapper).trigger('mouseenter')
    vi.advanceTimersByTime(300)
    await wrapper.find('button').trigger('click')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted()).toEqual({})

    getInstance(wrapper).open()
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('visible-change')).toEqual([[true]])

    getInstance(wrapper).close()
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]])
  })

  it('syncs with the visible prop for v-model:visible control', async () => {
    const wrapper = mountTooltip({ visible: false, manual: true })

    await wrapper.setProps({ visible: true })
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('update:visible')).toEqual([[true]])

    getInstance(wrapper).close()
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('update:visible')).toEqual([[true], [false]])
  })

  it('renders the content prop and links the trigger to the popper via aria-describedby', async () => {
    const wrapper = mountTooltip({ manual: true, content: '提示文案' })

    getInstance(wrapper).open()
    await nextTick()

    const popper = getPopper(wrapper)
    expect(popper.text()).toContain('提示文案')
    expect(popper.attributes('role')).toBe('tooltip')
    expect(popper.attributes('id')).toBeTruthy()
    expect(wrapper.find('button').attributes('aria-describedby')).toBe(popper.attributes('id'))

    getInstance(wrapper).close()
    await nextTick()
    expect(wrapper.find('button').attributes('aria-describedby')).toBeUndefined()
  })

  it('prefers the content slot over the content prop', async () => {
    const wrapper = mountTooltip(
      { manual: true, content: '属性文案' },
      { content: '<em>插槽文案</em>' },
    )

    getInstance(wrapper).open()
    await nextTick()

    expect(getPopper(wrapper).find('em').text()).toBe('插槽文案')
    expect(getPopper(wrapper).text()).not.toContain('属性文案')
  })

  it('positions the popper and marks the arrow with the effective placement', async () => {
    const wrapper = mountTooltip({ manual: true, placement: 'top' })

    getInstance(wrapper).open()
    await nextTick()

    const popper = getPopper(wrapper)
    expect((popper.element as HTMLElement).style.left).not.toBe('')
    expect((popper.element as HTMLElement).style.top).not.toBe('')
    expect(popper.find('.el-like-tooltip__arrow').classes()).toEqual(
      expect.arrayContaining([expect.stringMatching(/^is-(top|bottom|left|right)$/)]),
    )
  })
})
