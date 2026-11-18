import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import ElementLike from '@/bundle'
import { setupAuthTest } from '@/__tests__/helpers/auth'
import ChangePasswordDialog from '../ChangePasswordDialog.vue'

let wrapper: VueWrapper | undefined
let context: ReturnType<typeof setupAuthTest>

const setValue = async (name: string, value: string) => {
  await wrapper?.find(`input[name="${name}"]`).setValue(value)
}

describe('ChangePasswordDialog', () => {
  beforeEach(async () => {
    context = setupAuthTest()
    await context.login()
    wrapper = mount(ChangePasswordDialog, {
      props: { visible: true },
      global: { plugins: [context.pinia, ElementLike], stubs: { teleport: true } },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('validates password length and confirmation before submitting', async () => {
    await setValue('current-password', 'oldpassword123')
    await setValue('new-password', 'weak')
    await setValue('confirm-password', 'different')

    await wrapper?.find('form').trigger('submit')

    expect(wrapper?.text()).toContain('密码需为 8-72 位')
    expect(wrapper?.text()).toContain('两次输入的新密码不一致')
    expect(context.api.changePassword).not.toHaveBeenCalled()
  })

  it('changes the password and immediately uses the renewed token', async () => {
    await setValue('current-password', 'oldpassword123')
    await setValue('new-password', 'newpassword456')
    await setValue('confirm-password', 'newpassword456')

    await wrapper?.find('form').trigger('submit')
    await vi.waitFor(() => {
      expect(wrapper?.find('.password-success').exists()).toBe(true)
    })

    expect(context.api.changePassword).toHaveBeenCalledWith('test-token', {
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    })
    expect(context.authStore.accessToken).toBe('renewed-token')
    expect(wrapper?.find('input[name="current-password"]').exists()).toBe(false)
  })

  it('shows an incorrect old password beside its field', async () => {
    context.api.changePassword.mockRejectedValue(
      new ApiError('旧密码错误', { status: 400, code: 'INVALID_OLD_PASSWORD' }),
    )
    await setValue('current-password', 'incorrect')
    await setValue('new-password', 'newpassword456')
    await setValue('confirm-password', 'newpassword456')

    await wrapper?.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper?.text()).toContain('旧密码错误')
  })
})
