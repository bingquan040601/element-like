import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Dropdown from '../Dropdown.vue'
import type { DropdownMenuOption } from '../props'

const basicOptions: DropdownMenuOption[] = [
  { label: '查看', value: 'view' },
  { label: '编辑', value: 'edit' },
]

const mountDropdown = (props: Record<string, unknown> = {}) =>
  mount(Dropdown, {
    props: { menuOptions: basicOptions, ...props },
    slots: { default: '<button type="button">触发按钮</button>' },
    global: {
      stubs: { teleport: true },
      components: { FontAwesomeIcon },
    },
  })

const getTriggerButton = (wrapper: VueWrapper) => wrapper.find('.el-like-tooltip__trigger button')
const getPopper = (wrapper: VueWrapper) => wrapper.find('.el-like-tooltip')
const getItems = (wrapper: VueWrapper) => wrapper.findAll('.el-like-dropdown-menu__action')

describe('ElLike-Dropdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the trigger slot and keeps the menu hidden with spec defaults', () => {
    const wrapper = mountDropdown()

    expect(wrapper.find('.el-like-tooltip__trigger').text()).toBe('触发按钮')
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.props('menuOptions')).toEqual(basicOptions)
    expect(wrapper.props('hideAfterClick')).toBe(false)
    expect(wrapper.props('trigger')).toBe('click')
    expect(wrapper.props('placement')).toBe('bottom')
    expect(wrapper.emitted()).toEqual({})
  })

  it('opens on click and renders every menu option', async () => {
    const wrapper = mountDropdown()

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()

    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('visible-change')).toEqual([[true]])

    const items = getItems(wrapper)
    expect(items).toHaveLength(2)
    expect(items[0]?.text()).toContain('查看')
    expect(items[1]?.text()).toContain('编辑')

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]])
  })

  it('emits select with the clicked option and stays open by default', async () => {
    const wrapper = mountDropdown()

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()

    await getItems(wrapper)[0]?.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[basicOptions[0]]])
    expect(getPopper(wrapper).exists()).toBe(true)
  })

  it('closes after click when hideAfterClick is true', async () => {
    const wrapper = mountDropdown({ hideAfterClick: true })

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()

    await getItems(wrapper)[1]?.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[basicOptions[1]]])
    expect(getPopper(wrapper).exists()).toBe(false)
    expect(wrapper.emitted('visible-change')).toEqual([[true], [false]])
  })

  it('ignores disabled options: no select and no close', async () => {
    const disabledOptions: DropdownMenuOption[] = [
      { label: '查看', value: 'view' },
      { label: '删除', value: 'delete', disabled: true },
    ]
    const wrapper = mountDropdown({ menuOptions: disabledOptions, hideAfterClick: true })

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()

    const disabledItem = getItems(wrapper)[1]
    expect(disabledItem?.attributes('disabled')).toBeDefined()

    await disabledItem?.trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    expect(getPopper(wrapper).exists()).toBe(true)
  })

  it('marks divided items and renders option icons', async () => {
    const dividedOptions: DropdownMenuOption[] = [
      { label: '上传', value: 'upload', divided: true },
      { label: '删除', value: 'delete', icon: 'trash-can' },
    ]
    const wrapper = mountDropdown({ menuOptions: dividedOptions })

    await getTriggerButton(wrapper).trigger('click')
    await nextTick()

    expect(wrapper.find('.el-like-dropdown-menu__item').classes()).toContain('is-divided')
    expect(wrapper.find('.el-like-dropdown-menu__icon').exists()).toBe(true)
  })

  it('re-emits update:visible for v-model:visible control', async () => {
    const wrapper = mountDropdown({ manual: true, visible: false })

    await wrapper.setProps({ visible: true })
    await nextTick()

    expect(getPopper(wrapper).exists()).toBe(true)
    expect(wrapper.emitted('update:visible')).toEqual([[true]])
  })

  it('works with the inherited hover trigger', async () => {
    const wrapper = mountDropdown({ trigger: 'hover' })

    await wrapper.find('.el-like-tooltip__trigger').trigger('mouseenter')
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(true)

    await getPopper(wrapper).trigger('mouseleave')
    vi.advanceTimersByTime(100)
    await nextTick()
    expect(getPopper(wrapper).exists()).toBe(false)
  })

  it('applies the internal dropdown class and merges popperClass', async () => {
    const wrapper = mountDropdown({ manual: true, popperClass: 'custom-popper', visible: true })
    await nextTick()

    const classes = getPopper(wrapper).classes()
    expect(classes).toContain('el-like-dropdown')
    expect(classes).toContain('custom-popper')
  })
})
