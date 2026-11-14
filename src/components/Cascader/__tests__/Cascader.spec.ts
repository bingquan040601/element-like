import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAngleDown,
  faAngleRight,
  faCheck,
  faCircleXmark,
  faSpinner,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Cascader from '../Cascader.vue'
import type {
  CascaderConfig,
  CascaderLazyLoad,
  CascaderNode,
  CascaderOption,
  CascaderValue,
} from '../props'

library.add(faAngleDown, faAngleRight, faCheck, faCircleXmark, faSpinner, faXmark)

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖' },
          { value: 'liangzhu', label: '良渚', disabled: true },
        ],
      },
      {
        value: 'ningbo',
        label: '宁波',
        children: [{ value: 'dongqianhu', label: '东钱湖' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
        children: [{ value: 'xuanwuhu', label: '玄武湖' }],
      },
    ],
  },
  { value: 'disabled', label: '禁用节点', disabled: true },
]

const wrappers: VueWrapper[] = []
const mountCascader = (props: Record<string, unknown> = {}) => {
  const wrapper = mount(Cascader, {
    props: { options, ...props },
    attachTo: document.body,
    global: {
      stubs: { teleport: true },
      components: { FontAwesomeIcon },
    },
  })
  wrappers.push(wrapper)
  return wrapper
}

const getInput = (wrapper: VueWrapper) => wrapper.find('input[role="combobox"]')
const getPopper = (wrapper: VueWrapper) => wrapper.find('.el-like-cascader__popper')
const getMenus = (wrapper: VueWrapper) => wrapper.findAll('.el-like-cascader__menu')
const getNodes = (wrapper: VueWrapper) => wrapper.findAll('.el-like-cascader__node')
const getNode = (wrapper: VueWrapper, label: string) =>
  getNodes(wrapper).find((node) => node.find('.el-like-cascader__node-label').text() === label)

const openDropdown = async (wrapper: VueWrapper) => {
  await getInput(wrapper).trigger('click')
  await nextTick()
}

const clickNode = async (wrapper: VueWrapper, label: string) => {
  const node = getNode(wrapper, label)
  expect(node, `应渲染节点：${label}`).toBeDefined()
  await node?.trigger('click')
  await nextTick()
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('ElLike-Cascader', () => {
  it('renders a closed combobox with placeholder and no initial events', () => {
    const wrapper = mountCascader()

    expect(getInput(wrapper).attributes('placeholder')).toBe('请选择')
    expect(getInput(wrapper).attributes('aria-expanded')).toBe('false')
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted()).toEqual({})
  })

  it('expands columns and emits the selected leaf path', async () => {
    const wrapper = mountCascader()
    await openDropdown(wrapper)
    expect(getMenus(wrapper)).toHaveLength(1)

    await clickNode(wrapper, '浙江')
    expect(getMenus(wrapper)).toHaveLength(2)
    expect(wrapper.emitted('expand-change')).toEqual([[['zhejiang']]])

    await clickNode(wrapper, '杭州')
    expect(getMenus(wrapper)).toHaveLength(3)
    await clickNode(wrapper, '西湖')

    const path = ['zhejiang', 'hangzhou', 'xihu']
    expect(wrapper.emitted('update:modelValue')).toEqual([[path]])
    expect(wrapper.emitted('change')).toEqual([[path]])
    expect(getPopper(wrapper).exists()).toBe(false)
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('浙江 / 杭州 / 西湖')
  })

  it('restores the active columns from an initial model value', async () => {
    const wrapper = mountCascader({ modelValue: ['zhejiang', 'hangzhou', 'xihu'] })
    await openDropdown(wrapper)

    expect(getMenus(wrapper)).toHaveLength(3)
    expect(getNode(wrapper, '西湖')?.classes()).toContain('is-checked')
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('浙江 / 杭州 / 西湖')
  })

  it('clears the value without opening the dropdown', async () => {
    const wrapper = mountCascader({
      modelValue: ['zhejiang', 'hangzhou', 'xihu'],
      clearable: true,
    })

    await wrapper.find('.el-like-cascader__clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[null]])
    expect(wrapper.emitted('change')).toEqual([[null]])
    expect(wrapper.emitted('clear')).toEqual([[]])
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('syncs external model updates and rebuilt option labels', async () => {
    const wrapper = mountCascader()
    await wrapper.setProps({ modelValue: ['zhejiang', 'hangzhou', 'xihu'] })
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('浙江 / 杭州 / 西湖')

    const nextOptions = structuredClone(options)
    const zhejiang = nextOptions[0]
    const hangzhou = zhejiang?.children?.[0]
    const xihu = hangzhou?.children?.[0]
    if (xihu) xihu.label = '西湖景区'
    await wrapper.setProps({ options: nextOptions })
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('浙江 / 杭州 / 西湖景区')
  })

  it('supports custom fields, scalar values and leaf-only labels', async () => {
    const customOptions = [
      { id: 1, name: '父级', items: [{ id: 2, name: '子级', unavailable: false }] },
    ]
    const config: CascaderConfig = {
      value: 'id',
      label: 'name',
      children: 'items',
      disabled: 'unavailable',
      emitPath: false,
    }
    const wrapper = mountCascader({
      options: customOptions,
      props: config,
      showAllLevels: false,
    })

    await openDropdown(wrapper)
    await clickNode(wrapper, '父级')
    await clickNode(wrapper, '子级')
    expect(wrapper.emitted('update:modelValue')).toEqual([[2]])
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('子级')
  })

  it('allows selecting a parent in checkStrictly mode', async () => {
    const wrapper = mountCascader({ props: { checkStrictly: true } })
    await openDropdown(wrapper)
    await clickNode(wrapper, '浙江')

    expect(wrapper.emitted('update:modelValue')).toEqual([[['zhejiang']]])
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('ignores disabled nodes and disables the whole control', async () => {
    const wrapper = mountCascader()
    await openDropdown(wrapper)
    await clickNode(wrapper, '禁用节点')
    expect(getMenus(wrapper)).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.setProps({ disabled: true })
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(getInput(wrapper).attributes('disabled')).toBeDefined()
    await getInput(wrapper).trigger('click')
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('checks all enabled descendant leaves from a multiple parent checkbox', async () => {
    const wrapper = mountCascader({ props: { multiple: true } })
    await openDropdown(wrapper)
    const checkbox = getNode(wrapper, '浙江')?.find('input[type="checkbox"]')

    await checkbox?.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      ['zhejiang', 'hangzhou', 'xihu'],
      ['zhejiang', 'ningbo', 'dongqianhu'],
    ])
    expect((checkbox?.element as HTMLInputElement | undefined)?.indeterminate).toBe(false)

    await checkbox?.setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([])
  })

  it('sets indeterminate when only part of a multiple branch is checked', async () => {
    const wrapper = mountCascader({
      modelValue: [['zhejiang', 'hangzhou', 'xihu']],
      props: { multiple: true },
    })
    await openDropdown(wrapper)
    const checkbox = getNode(wrapper, '浙江')?.find('input[type="checkbox"]')

    expect((checkbox?.element as HTMLInputElement | undefined)?.indeterminate).toBe(true)
    expect((checkbox?.element as HTMLInputElement | undefined)?.checked).toBe(false)
  })

  it('keeps parent and child selections independent in strict multiple mode', async () => {
    const wrapper = mountCascader({ props: { multiple: true, checkStrictly: true } })
    await openDropdown(wrapper)
    await getNode(wrapper, '浙江')?.find('input[type="checkbox"]')?.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([['zhejiang']])

    await clickNode(wrapper, '浙江')
    await clickNode(wrapper, '杭州')
    await getNode(wrapper, '杭州')?.find('input[type="checkbox"]')?.setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([
      ['zhejiang'],
      ['zhejiang', 'hangzhou'],
    ])
  })

  it('collapses tags, removes tags and supports Backspace removal', async () => {
    const firstPath = ['zhejiang', 'hangzhou', 'xihu']
    const secondPath = ['jiangsu', 'nanjing', 'xuanwuhu']
    const wrapper = mountCascader({
      modelValue: [firstPath, secondPath],
      props: { multiple: true },
      collapseTags: true,
    })

    expect(wrapper.findAll('.el-like-cascader__tag-close')).toHaveLength(1)
    expect(wrapper.find('.el-like-cascader__tag.is-collapse').text()).toBe('+ 1')
    await wrapper.find('.el-like-cascader__tag-close').trigger('click')
    expect(wrapper.emitted('remove-tag')).toEqual([[firstPath]])
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([secondPath])

    await getInput(wrapper).trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual([])
    expect(wrapper.emitted('remove-tag')?.[1]).toEqual([secondPath])
  })

  it('debounces filtering and selects a flattened suggestion', async () => {
    vi.useFakeTimers()
    const wrapper = mountCascader({ filterable: true })
    await openDropdown(wrapper)
    await getInput(wrapper).setValue('西湖')

    vi.advanceTimersByTime(299)
    await nextTick()
    expect(wrapper.find('.el-like-cascader__suggestions').exists()).toBe(false)
    vi.advanceTimersByTime(1)
    await nextTick()

    const suggestion = wrapper.find('.el-like-cascader__suggestion')
    expect(suggestion.text()).toContain('浙江 / 杭州 / 西湖')
    await suggestion.trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['zhejiang', 'hangzhou', 'xihu']]])
  })

  it('supports keyboard navigation through search suggestions', async () => {
    const wrapper = mountCascader({ filterable: true, debounce: 0 })
    await openDropdown(wrapper)
    await getInput(wrapper).setValue('湖')
    await flushPromises()
    expect(wrapper.findAll('.el-like-cascader__suggestion').length).toBeGreaterThan(1)

    await getInput(wrapper).trigger('keydown', { key: 'ArrowDown' })
    await getInput(wrapper).trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toBeDefined()
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('honors custom filter methods and beforeFilter rejection', async () => {
    const filterMethod = vi.fn<(node: CascaderNode, keyword: string) => boolean>((node, keyword) =>
      String(node.value).includes(keyword),
    )
    const wrapper = mountCascader({
      filterable: true,
      debounce: 0,
      filterMethod,
      beforeFilter: vi.fn<() => Promise<boolean>>().mockResolvedValue(false),
    })
    await openDropdown(wrapper)
    await getInput(wrapper).setValue('xihu')
    await flushPromises()

    expect(wrapper.find('.el-like-cascader__suggestions').exists()).toBe(false)
    expect(filterMethod).not.toHaveBeenCalled()

    await wrapper.setProps({
      beforeFilter: vi.fn<() => Promise<boolean>>().mockResolvedValue(true),
    })
    await getInput(wrapper).setValue('xihu2')
    await getInput(wrapper).setValue('xihu')
    await flushPromises()
    expect(filterMethod).toHaveBeenCalled()
    expect(wrapper.findAll('.el-like-cascader__suggestion')).toHaveLength(1)
  })

  it('preserves text entered while opening a closed filterable control', async () => {
    const wrapper = mountCascader({ filterable: true, debounce: 0 })
    expect(getPopper(wrapper).exists()).toBe(false)

    await getInput(wrapper).setValue('西湖')
    await flushPromises()
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('西湖')
    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.findAll('.el-like-cascader__suggestion')).toHaveLength(1)
  })

  it('accepts synchronous lazyLoad and survives equivalent inline config updates', async () => {
    const lazyLoad: CascaderLazyLoad = () => [{ value: 'child', label: '异步子级', leaf: true }]
    const wrapper = mountCascader({
      options: [{ value: 'parent', label: '异步父级' }],
      props: { lazy: true, lazyLoad },
    })
    await openDropdown(wrapper)
    await clickNode(wrapper, '异步父级')
    await nextTick()
    await clickNode(wrapper, '异步子级')
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('异步父级 / 异步子级')

    // 模拟父组件在内联 :props="{ lazy: true, lazyLoad }" 下响应 v-model 重渲染
    await wrapper.setProps({
      modelValue: ['parent', 'child'],
      props: { lazy: true, lazyLoad },
    })
    const instance = wrapper.vm as unknown as { getCheckedNodes: () => CascaderNode[] }
    expect(instance.getCheckedNodes().map((node) => node.label)).toEqual(['异步子级'])
    expect((getInput(wrapper).element as HTMLInputElement).value).toBe('异步父级 / 异步子级')
  })

  it('loads children with the lazyLoad resolve callback', async () => {
    let resolveChildren: ((data?: CascaderOption[]) => void) | undefined
    const lazyLoad = vi.fn<CascaderLazyLoad>((_node, resolve) => {
      resolveChildren = resolve
    })
    const wrapper = mountCascader({
      options: [{ value: 'parent', label: '异步父级' }],
      props: { lazy: true, lazyLoad },
    })
    await openDropdown(wrapper)
    await clickNode(wrapper, '异步父级')

    expect(lazyLoad).toHaveBeenCalledOnce()
    expect(getNode(wrapper, '异步父级')?.attributes('aria-busy')).toBe('true')
    resolveChildren?.([{ value: 'child', label: '异步子级', leaf: true }])
    await nextTick()
    await clickNode(wrapper, '异步子级')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['parent', 'child']]])
  })

  it('accepts a Promise returned by lazyLoad and can retry rejected loads', async () => {
    const lazyLoad = vi
      .fn<CascaderLazyLoad>()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce([{ value: 'child', label: '异步子级', leaf: true }])
    const wrapper = mountCascader({
      options: [{ value: 'parent', label: '异步父级' }],
      props: { lazy: true, lazyLoad },
    })
    await openDropdown(wrapper)
    await clickNode(wrapper, '异步父级')
    await flushPromises()
    expect(wrapper.emitted('load-error')).toHaveLength(1)
    expect(getNode(wrapper, '异步父级')?.attributes('aria-busy')).toBe('false')

    await clickNode(wrapper, '异步父级')
    await flushPromises()
    await nextTick()
    expect(getNode(wrapper, '异步子级')).toBeDefined()
  })

  it('closes on outside pointer interaction and emits visible-change', async () => {
    const wrapper = mountCascader()
    await openDropdown(wrapper)
    expect(wrapper.emitted('visible-change')).toEqual([[true]])

    document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]])
  })

  it('renders custom node slots and exposes checked nodes', async () => {
    const modelValue: CascaderValue = ['zhejiang', 'hangzhou', 'xihu']
    const wrapper = mount(Cascader, {
      props: { options, modelValue },
      slots: {
        default: ({ node, data }: { node: CascaderNode; data: CascaderOption }) =>
          h('b', `${node.label}:${String(data.value)}`),
      },
      attachTo: document.body,
      global: { stubs: { teleport: true }, components: { FontAwesomeIcon } },
    })
    wrappers.push(wrapper)
    await openDropdown(wrapper)
    const customLabels = wrapper.findAll('.el-like-cascader__node-label b')
    expect(customLabels.map((label) => label.text())).toContain('西湖:xihu')

    const instance = wrapper.vm as unknown as {
      getCheckedNodes: (leafOnly?: boolean) => CascaderNode[]
      toggleDropDownVisible: (visible?: boolean) => void
    }
    expect(instance.getCheckedNodes(true)[0]?.value).toBe('xihu')
    instance.toggleDropDownVisible(false)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
  })
})
