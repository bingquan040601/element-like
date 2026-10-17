import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pager from '../Pager.vue'
import type { PagerSize, PagerType } from '../props'

const mountPager = (
  props: {
    total?: number
    currentPage?: number
    pageCount?: number
    type?: PagerType
    size?: PagerSize
  } = {},
) => mount(Pager, { props })

const getPageNumbers = (wrapper: ReturnType<typeof mountPager>) =>
  wrapper.findAll('.el-like-pager__page').map((button) => Number(button.text()))

describe('ElLike-Pager', () => {
  it('renders an empty navigation by default', () => {
    const wrapper = mountPager()

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('分页导航')
    expect(getPageNumbers(wrapper)).toEqual([])
  })

  it('renders every page when total does not exceed pageCount', () => {
    const wrapper = mountPager({ total: 5, currentPage: 3 })
    const activePage = wrapper.find('.is-active')

    expect(getPageNumbers(wrapper)).toEqual([1, 2, 3, 4, 5])
    expect(activePage.text()).toBe('3')
    expect(activePage.attributes('aria-current')).toBe('page')
    expect(wrapper.find('.el-like-pager__ellipsis').exists()).toBe(false)
  })

  it('emits current-change only when a different page is selected', async () => {
    const wrapper = mountPager({ total: 5, currentPage: 1 })
    const pages = wrapper.findAll('.el-like-pager__page')

    await pages[2]?.trigger('click')
    expect(wrapper.emitted('current-change')).toEqual([[3]])

    await pages[0]?.trigger('click')
    expect(wrapper.emitted('current-change')).toHaveLength(1)
    expect(wrapper.props('currentPage')).toBe(1)
  })

  it('updates the active page when the controlled prop changes', async () => {
    const wrapper = mountPager({ total: 5, currentPage: 1 })

    await wrapper.setProps({ currentPage: 4 })

    expect(wrapper.find('.is-active').text()).toBe('4')
  })

  it('collapses a middle window while preserving first, current and last pages', () => {
    const wrapper = mountPager({ total: 50, currentPage: 25, pageCount: 7 })

    expect(getPageNumbers(wrapper)).toEqual([1, 23, 24, 25, 26, 27, 50])
    expect(wrapper.findAll('.el-like-pager__ellipsis')).toHaveLength(2)
    expect(wrapper.find('.is-active').text()).toBe('25')
  })

  it('collapses only the required side near the first and last pages', () => {
    const firstWrapper = mountPager({ total: 50, currentPage: 1, pageCount: 7 })
    const lastWrapper = mountPager({ total: 50, currentPage: 50, pageCount: 7 })

    expect(getPageNumbers(firstWrapper)).toEqual([1, 2, 3, 4, 5, 6, 50])
    expect(firstWrapper.findAll('.el-like-pager__ellipsis')).toHaveLength(1)
    expect(getPageNumbers(lastWrapper)).toEqual([1, 45, 46, 47, 48, 49, 50])
    expect(lastWrapper.findAll('.el-like-pager__ellipsis')).toHaveLength(1)
  })

  it('uses ellipses to jump by pageCount', async () => {
    const wrapper = mountPager({ total: 100, currentPage: 50, pageCount: 10 })

    await wrapper.find('.el-like-pager__ellipsis--previous').trigger('click')
    await wrapper.find('.el-like-pager__ellipsis--next').trigger('click')

    expect(wrapper.emitted('current-change')).toEqual([[40], [60]])
  })

  it.each([1, 2, 3])('keeps the current page visible with pageCount %i', (pageCount) => {
    const wrapper = mountPager({ total: 20, currentPage: 10, pageCount })
    const pages = getPageNumbers(wrapper)

    expect(pages).toHaveLength(pageCount)
    expect(pages).toContain(10)
    expect(wrapper.find('.is-active').text()).toBe('10')
  })

  it('normalizes invalid numeric props without emitting an event', () => {
    const emptyWrapper = mountPager({ total: -2 })
    const boundedWrapper = mountPager({ total: 5.8, currentPage: 20, pageCount: 2.9 })

    expect(getPageNumbers(emptyWrapper)).toEqual([])
    expect(getPageNumbers(boundedWrapper)).toEqual([4, 5])
    expect(boundedWrapper.find('.is-active').text()).toBe('5')
    expect(boundedWrapper.emitted('current-change')).toBeUndefined()
  })

  it('maps type and size to modifier classes', () => {
    const wrapper = mountPager({ total: 5, type: 'success', size: 'small' })

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['el-like-pager--success', 'el-like-pager--small']),
    )
  })
})
