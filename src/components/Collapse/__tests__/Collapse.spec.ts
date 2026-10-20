import { h } from 'vue'
import type { VNode } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Collapse from '../Collapse.vue'
import CollapseItem from '../../CollapseItem/CollapseItem.vue'

interface ItemOptions {
  title?: string
  disabled?: boolean
}

const createItem = (name: string, options: ItemOptions = {}) =>
  h(CollapseItem, { name, ...options }, { default: () => `${name} 的内容` })

const mountCollapse = (
  props: { modelValue?: string[]; accordion?: boolean } = {},
  items: VNode[] = [],
) => mount(Collapse, { props, slots: { default: () => items } })

const getHeaders = (wrapper: ReturnType<typeof mountCollapse>) =>
  wrapper.findAll('.el-like-collapse-item__header')

describe('ElLike-Collapse', () => {
  it('renders item titles with name as the fallback and keeps all panels closed by default', () => {
    const wrapper = mountCollapse({}, [createItem('a'), createItem('b', { title: '面板 B' })])

    expect(wrapper.classes()).toContain('el-like-collapse')
    expect(getHeaders(wrapper).map((header) => header.text())).toEqual(['a', '面板 B'])
    expect(wrapper.findAll('.el-like-collapse-item.is-active')).toHaveLength(0)
    expect(getHeaders(wrapper).map((header) => header.attributes('aria-expanded'))).toEqual([
      'false',
      'false',
    ])
  })

  it('opens items listed in modelValue on mount', () => {
    const wrapper = mountCollapse({ modelValue: ['b'] }, [createItem('a'), createItem('b')])
    const items = wrapper.findAll('.el-like-collapse-item')

    expect(items[0]?.classes()).not.toContain('is-active')
    expect(items[1]?.classes()).toContain('is-active')
    expect(getHeaders(wrapper)[1]?.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.el-like-collapse-item__wrap')[1]?.isVisible()).toBe(true)
  })

  it('toggles a panel on header click and emits update:modelValue and change', async () => {
    const wrapper = mountCollapse({}, [createItem('a'), createItem('b')])

    await getHeaders(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['a']]])
    expect(wrapper.emitted('change')).toEqual([[['a']]])

    await getHeaders(wrapper)[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['a', 'b']])

    // 再次点击已展开面板将其收起
    await getHeaders(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([['b']])
  })

  it('ignores clicks on disabled items', async () => {
    const wrapper = mountCollapse({}, [createItem('a', { disabled: true })])

    await getHeaders(wrapper)[0]?.trigger('click')

    expect(wrapper.emitted()).toEqual({})
    expect(wrapper.find('.el-like-collapse-item').classes()).toContain('is-disabled')
    expect(getHeaders(wrapper)[0]?.attributes('aria-expanded')).toBe('false')
  })

  it('keeps at most one panel open in accordion mode', async () => {
    const wrapper = mountCollapse({ modelValue: ['a'], accordion: true }, [
      createItem('a'),
      createItem('b'),
    ])

    await getHeaders(wrapper)[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']]])

    await getHeaders(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['a']])

    // 手风琴模式下点击已展开面板收起全部
    await getHeaders(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([[]])
  })

  it('syncs item states when modelValue changes externally', async () => {
    const wrapper = mountCollapse({ modelValue: ['a'] }, [createItem('a'), createItem('b')])

    await wrapper.setProps({ modelValue: ['b'] })

    const items = wrapper.findAll('.el-like-collapse-item')
    expect(items[0]?.classes()).not.toContain('is-active')
    expect(items[1]?.classes()).toContain('is-active')
  })

  it('renders the title slot and the default slot content', () => {
    const wrapper = mountCollapse({ modelValue: ['a'] }, [
      h(
        CollapseItem,
        { name: 'a' },
        {
          title: () => '自定义标题',
          default: () => h('p', '面板内容'),
        },
      ),
    ])

    expect(wrapper.find('.el-like-collapse-item__title').exists()).toBe(false)
    expect(getHeaders(wrapper)[0]?.text()).toBe('自定义标题')
    expect(wrapper.find('p').text()).toBe('面板内容')
  })

  it('renders a standalone CollapseItem as a closed panel without crashing', async () => {
    const wrapper = mount(CollapseItem, { props: { name: 'solo', title: '独立面板' } })

    expect(wrapper.text()).toContain('独立面板')
    expect(wrapper.find('.el-like-collapse-item').classes()).not.toContain('is-active')

    // 无父级 Collapse 时点击不生效：面板保持收起
    await wrapper.find('.el-like-collapse-item__header').trigger('click')
    expect(wrapper.find('.el-like-collapse-item').classes()).not.toContain('is-active')
    expect(wrapper.find('.el-like-collapse-item__wrap').isVisible()).toBe(false)
  })
})
