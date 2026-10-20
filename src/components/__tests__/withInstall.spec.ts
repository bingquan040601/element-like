import { createApp, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ElementLike, { ElLikeButton } from '@/bundle'
import Icon from '@/components/Icon'

describe('withInstall 按需安装', () => {
  it('app.use(ElLikeButton) 同时注册原始名与去连字符别名', () => {
    const app = createApp({ render: () => h('div') })
    app.use(ElLikeButton)

    expect(app.component('ElLike-Button')).toBe(ElLikeButton)
    expect(app.component('ElLikeButton')).toBe(ElLikeButton)
  })

  it('app.use(Icon) 连带注册图标库与全局图标组件，图标可真实绘制', () => {
    const wrapper = mount(Icon, {
      props: { icon: 'house' },
      global: { plugins: [Icon] },
    })

    expect(wrapper.find('.el-like-icon').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('app.use(ElLikeButton) 单独安装时 loading 状态开箱即用（自带 spinner 图标注册）', () => {
    const wrapper = mount(ElLikeButton, {
      props: { loading: true },
      slots: { default: '确定' },
      global: { plugins: [ElLikeButton] },
    })

    expect(wrapper.find('.el-like-icon svg').exists()).toBe(true)
  })

  it('app.use(ElementLike) 注册全部组件、别名与图标组件', () => {
    const app = createApp({ render: () => h('div') })
    app.use(ElementLike)

    const names = ['Icon', 'Button', 'Card', 'Dialog', 'Pager', 'Collapse', 'CollapseItem', 'Tooltip', 'Dropdown']
    names.forEach((name) => {
      expect(app.component(`ElLike-${name}`)).toBeDefined()
      expect(app.component(`ElLike${name}`)).toBeDefined()
    })
    expect(app.component('font-awesome-icon')).toBeDefined()
  })
})
