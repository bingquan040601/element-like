import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Dialog from '../Dialog.vue'

const mountDialog = (
  props: {
    title?: string
    width?: string
    top?: string
    visible?: boolean
    closeOnClickModal?: boolean
  } = {},
  slots: Record<string, string> = {},
) =>
  mount(Dialog, {
    props,
    slots,
    global: {
      stubs: { teleport: true },
    },
  })

describe('ElLike-Dialog', () => {
  it('is hidden by default and does not listen for Escape', () => {
    const wrapper = mountDialog()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.find('.el-like-dialog__overlay').exists()).toBe(false)
    expect(wrapper.props('title')).toBe('提示')
    expect(wrapper.props('width')).toBe('50%')
    expect(wrapper.props('top')).toBe('15vh')
    expect(wrapper.props('visible')).toBe(false)
    expect(wrapper.props('closeOnClickModal')).toBe(true)
    expect(wrapper.emitted('close')).toBeUndefined()
  })

  it('renders an accessible dialog with default dimensions', () => {
    const wrapper = mountDialog({ visible: true })
    const dialog = wrapper.find('[role="dialog"]')
    const title = wrapper.find('.el-like-dialog__title')

    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-labelledby')).toBe(title.attributes('id'))
    expect((dialog.element as HTMLElement).style.width).toBe('50%')
    expect((dialog.element as HTMLElement).style.marginTop).toBe('15vh')
    expect(title.text()).toBe('提示')
  })

  it('applies custom width and top values', () => {
    const wrapper = mountDialog({ visible: true, width: '640px', top: '10vh' })
    const dialog = wrapper.find('[role="dialog"]')

    expect((dialog.element as HTMLElement).style.width).toBe('640px')
    expect((dialog.element as HTMLElement).style.marginTop).toBe('10vh')
  })

  it('supports custom title, body and footer slots', () => {
    const wrapper = mountDialog(
      { visible: true, title: '属性标题' },
      {
        title: '<span>自定义标题</span>',
        default: '<section>自定义主体</section>',
        footer: '<button type="button">确定</button>',
      },
    )

    expect(wrapper.find('.el-like-dialog__title').text()).toBe('自定义标题')
    expect(wrapper.find('.el-like-dialog__body section').text()).toBe('自定义主体')
    expect(wrapper.find('.el-like-dialog__footer button').text()).toBe('确定')
  })

  it('omits unused body and footer containers', () => {
    const wrapper = mountDialog({ visible: true })

    expect(wrapper.find('.el-like-dialog__body').exists()).toBe(false)
    expect(wrapper.find('.el-like-dialog__footer').exists()).toBe(false)
  })

  it('emits close from the close button and overlay', async () => {
    const wrapper = mountDialog({ visible: true })

    await wrapper.find('.el-like-dialog').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.find('.el-like-dialog__close').trigger('click')
    await wrapper.find('.el-like-dialog__overlay').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('ignores overlay clicks when closeOnClickModal is false', async () => {
    const wrapper = mountDialog({ visible: true, closeOnClickModal: false })

    await wrapper.find('.el-like-dialog__overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.find('.el-like-dialog__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on Escape only while visible', async () => {
    const wrapper = mountDialog({ visible: true })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)

    await wrapper.setProps({ visible: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
