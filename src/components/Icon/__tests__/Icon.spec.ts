import { library } from '@fortawesome/fontawesome-svg-core'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/vue-fontawesome'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Icon from '../Icon.vue'
import type { IconType } from '../props'

library.add(faUserSecret)

const mountIcon = (
  props: { icon: string; type?: IconType; color?: string } & Pick<
    FontAwesomeIconProps,
    'size' | 'rotation' | 'flip' | 'spin'
  >,
) => mount(Icon, { props, global: { components: { FontAwesomeIcon } } })

describe('ElLike-Icon', () => {
  it('prefixes the icon name with fa-solid fa-', () => {
    const wrapper = mountIcon({ icon: 'user-secret' })
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(svg.classes()).toContain('fa-user-secret')
  })

  it('maps type to a wrapper modifier class', () => {
    const wrapper = mountIcon({ icon: 'user-secret', type: 'primary' })
    expect(wrapper.classes()).toContain('el-like-icon')
    expect(wrapper.classes()).toContain('el-like-icon--primary')
  })

  it('does not forward own props (type) to font-awesome-icon', () => {
    const wrapper = mountIcon({ icon: 'user-secret', type: 'primary' })
    expect(wrapper.find('svg').attributes('type')).toBeUndefined()
  })

  it('applies color as inline style on the wrapper', () => {
    const wrapper = mountIcon({ icon: 'user-secret', color: 'tomato' })
    expect(wrapper.attributes('style')).toContain('color: tomato')
  })

  it('forwards size to font-awesome-icon', () => {
    const wrapper = mountIcon({ icon: 'user-secret', size: '2x' })
    expect(wrapper.find('svg').classes()).toContain('fa-2x')
  })

  it('forwards rotation, flip and animation props to font-awesome-icon', () => {
    const wrapper = mountIcon({ icon: 'user-secret', rotation: 90, flip: 'horizontal', spin: true })
    const classes = wrapper.find('svg').classes()
    expect(classes).toContain('fa-rotate-90')
    expect(classes).toContain('fa-flip-horizontal')
    expect(classes).toContain('fa-spin')
  })
})
