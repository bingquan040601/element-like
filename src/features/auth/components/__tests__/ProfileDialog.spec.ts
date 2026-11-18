import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import ElementLike from '@/bundle'
import { mockUser, setupAuthTest } from '@/__tests__/helpers/auth'
import ProfileDialog from '../ProfileDialog.vue'

let wrapper: VueWrapper | undefined
let context: ReturnType<typeof setupAuthTest>

const setValue = async (name: string, value: string) => {
  await wrapper?.find(`input[name="${name}"]`).setValue(value)
}

describe('ProfileDialog', () => {
  beforeEach(async () => {
    context = setupAuthTest()
    await context.login()
    wrapper = mount(ProfileDialog, {
      props: { visible: true },
      global: { plugins: [context.pinia, ElementLike], stubs: { teleport: true } },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('shows editable fields separately from read-only account information', () => {
    expect(wrapper?.find('input[name="nickname"]').element).toHaveProperty('value', 'Timmy')
    expect(wrapper?.find('input[name="email"]').element).toHaveProperty(
      'value',
      'timmy@example.com',
    )
    expect(wrapper?.find('input[name="username"]').exists()).toBe(false)
    expect(wrapper?.find('.profile__readonly').text()).toContain('huangbingquan')
    expect(wrapper?.find('.profile__readonly').text()).toContain('用户 ID')
    expect(wrapper?.find('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('saves normalized changes, updates the session and closes the dialog', async () => {
    const updatedUser = {
      ...mockUser,
      nickname: 'New name',
      email: 'new@example.com',
      updatedAt: '2026-11-18T08:00:00.000Z',
    }
    context.api.updateProfile.mockResolvedValue(updatedUser)
    await setValue('nickname', '  New name  ')
    await setValue('email', ' NEW@EXAMPLE.COM ')

    await wrapper?.find('form').trigger('submit')
    await flushPromises()

    expect(context.api.updateProfile).toHaveBeenCalledWith('test-token', {
      nickname: 'New name',
      email: 'new@example.com',
    })
    expect(context.authStore.user).toEqual(updatedUser)
    expect(wrapper?.emitted('close')).toHaveLength(1)
  })

  it('validates required nickname and email format before submitting', async () => {
    await setValue('nickname', '   ')
    await setValue('email', 'not-an-email')

    await wrapper?.find('form').trigger('submit')

    expect(wrapper?.text()).toContain('请输入昵称')
    expect(wrapper?.text()).toContain('请输入有效的邮箱地址')
    expect(context.api.updateProfile).not.toHaveBeenCalled()
  })

  it('shows an email conflict beside the email field', async () => {
    context.api.updateProfile.mockRejectedValue(
      new ApiError('邮箱已被使用', { status: 409, code: 'EMAIL_EXISTS' }),
    )
    await setValue('email', 'occupied@example.com')

    await wrapper?.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper?.text()).toContain('邮箱已被使用')
    expect(wrapper?.emitted('close')).toBeUndefined()
  })

  it('discards unsaved changes when reopened', async () => {
    await setValue('nickname', 'Unsaved')
    await wrapper?.setProps({ visible: false })
    await wrapper?.setProps({ visible: true })

    expect(wrapper?.find('input[name="nickname"]').element).toHaveProperty('value', 'Timmy')
    expect(context.api.updateProfile).not.toHaveBeenCalled()
  })
})
