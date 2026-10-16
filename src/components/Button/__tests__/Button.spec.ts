import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../Button.vue'
import type { ButtonSize, ButtonType } from '../props'

library.add(faSpinner, faUserSecret)

const mountButton = (
  props: {
    type?: ButtonType
    size?: ButtonSize
    plain?: boolean
    round?: boolean
    circle?: boolean
    disabled?: boolean
    loading?: boolean
    icon?: string
  } = {},
) =>
  mount(Button, {
    props,
    global: { components: { FontAwesomeIcon } },
  })

describe('ElLike-Button', () => {
  it('renders a native button with default theme and slot content', () => {
    const wrapper = mount(Button, {
      slots: { default: '确定' },
      global: { components: { FontAwesomeIcon } },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('el-like-button--default')
    expect(wrapper.text()).toBe('确定')
  })

  it('maps type and size to modifier classes', () => {
    const wrapper = mountButton({ type: 'primary', size: 'large' })

    expect(wrapper.classes()).toContain('el-like-button--primary')
    expect(wrapper.classes()).toContain('el-like-button--large')
  })

  it('does not add a redundant size class for the default size', () => {
    const wrapper = mountButton({ type: 'primary', size: 'default' })

    expect(wrapper.classes()).toContain('el-like-button--primary')
    expect(wrapper.classes()).not.toContain('el-like-button--default')
  })

  it('applies plain, round and circle state classes', () => {
    const wrapper = mountButton({ plain: true, round: true, circle: true })

    expect(wrapper.classes()).toEqual(expect.arrayContaining(['is-plain', 'is-round', 'is-circle']))
  })

  it('emits click with the native mouse event', async () => {
    const wrapper = mountButton()
    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toHaveLength(1)
    expect(wrapper.emitted('click')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
  })

  it.each([{ disabled: true }, { loading: true }])(
    'blocks click and disables the native button with %j',
    async (props) => {
      const wrapper = mountButton(props)
      await wrapper.trigger('click')

      expect(wrapper.attributes('disabled')).toBeDefined()
      expect(wrapper.emitted('click')).toBeUndefined()
    },
  )

  it('renders the requested icon', () => {
    const wrapper = mountButton({ icon: 'user-secret' })

    expect(wrapper.find('svg').classes()).toContain('fa-user-secret')
  })

  it('replaces the requested icon with a spinning loading icon', () => {
    const wrapper = mountButton({ icon: 'user-secret', loading: true })
    const svg = wrapper.find('svg')

    expect(svg.classes()).toContain('fa-spinner')
    expect(svg.classes()).toContain('fa-spin')
    expect(svg.classes()).not.toContain('fa-user-secret')
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('exposes the native root element through ref', () => {
    const wrapper = mountButton()

    expect(wrapper.vm.ref).toBe(wrapper.element)
  })
})
