import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../Card.vue'

const mountCard = (
  props: {
    width?: number
    imgHeight?: number
    summary?: string
  } = {},
  slots: Record<string, string> = {},
) =>
  mount(Card, {
    props: {
      imgSrc: '/images/card.jpg',
      ...props,
    },
    slots,
  })

describe('ElLike-Card', () => {
  it('renders the image and summary', () => {
    const wrapper = mountCard({ summary: '卡片摘要' })
    const image = wrapper.find('img')

    expect(wrapper.classes()).toContain('el-like-card')
    expect(image.attributes('src')).toBe('/images/card.jpg')
    expect(image.attributes('alt')).toBe('')
    expect(wrapper.find('.el-like-card__summary').text()).toBe('卡片摘要')
  })

  it('converts numeric width and image height to pixel styles', () => {
    const wrapper = mountCard({ width: 320, imgHeight: 180 })

    expect((wrapper.element as HTMLElement).style.width).toBe('320px')
    expect((wrapper.find('img').element as HTMLImageElement).style.height).toBe('180px')
  })

  it('preserves zero as a valid dimension', () => {
    const wrapper = mountCard({ width: 0, imgHeight: 0 })

    expect((wrapper.element as HTMLElement).style.width).toBe('0px')
    expect((wrapper.find('img').element as HTMLImageElement).style.height).toBe('0px')
  })

  it('renders custom default slot content when summary is absent', () => {
    const wrapper = mountCard({}, { default: '<strong>自定义摘要</strong>' })

    expect(wrapper.find('.el-like-card__summary strong').text()).toBe('自定义摘要')
  })

  it('prioritizes summary over default slot content', () => {
    const wrapper = mountCard({ summary: '属性摘要' }, { default: '<strong>插槽摘要</strong>' })

    expect(wrapper.find('.el-like-card__summary').text()).toBe('属性摘要')
    expect(wrapper.find('.el-like-card__summary strong').exists()).toBe(false)
  })

  it('renders custom footer slot content', () => {
    const wrapper = mountCard({}, { footer: '<button type="button">查看详情</button>' })

    expect(wrapper.find('.el-like-card__footer button').text()).toBe('查看详情')
  })

  it('omits optional dimensions and content areas by default', () => {
    const wrapper = mountCard()

    expect((wrapper.element as HTMLElement).style.width).toBe('')
    expect((wrapper.find('img').element as HTMLImageElement).style.height).toBe('')
    expect(wrapper.find('.el-like-card__summary').exists()).toBe(false)
    expect(wrapper.find('.el-like-card__footer').exists()).toBe(false)
  })
})
