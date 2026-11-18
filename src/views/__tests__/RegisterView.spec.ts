import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import ElementLike from '@/bundle'
import { createAppRouter } from '@/router'
import { setupAuthTest } from '@/__tests__/helpers/auth'
import RegisterView from '../RegisterView.vue'

let wrapper: VueWrapper | undefined
let context: ReturnType<typeof setupAuthTest>
let router: Router

const setValue = async (name: string, value: string) => {
  await wrapper?.find(`input[name="${name}"]`).setValue(value)
}

const submitValidForm = async () => {
  await setValue('username', 'huangbingquan')
  await setValue('email', 'TIMMY@EXAMPLE.COM')
  await setValue('nickname', 'Timmy')
  await setValue('new-password', 'password123')
  await setValue('confirm-password', 'password123')
  await wrapper?.find('form').trigger('submit')
  await flushPromises()
}

describe('RegisterView', () => {
  beforeEach(async () => {
    context = setupAuthTest()
    router = createAppRouter(createMemoryHistory())
    await router.push({ name: 'register', query: { redirect: '/button' } })
    await router.isReady()
    wrapper = mount(RegisterView, {
      global: { plugins: [context.pinia, router, ElementLike] },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('registers, stores the returned session and follows the redirect', async () => {
    await submitValidForm()

    await vi.waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/button')
    })
    expect(context.api.register).toHaveBeenCalledWith({
      username: 'huangbingquan',
      email: 'timmy@example.com',
      password: 'password123',
      nickname: 'Timmy',
    })
    expect(context.authStore.accessToken).toBe('test-token')
  })

  it('maps API field errors to the corresponding inputs', async () => {
    context.api.register.mockRejectedValue(
      new ApiError('邮箱已被注册', { status: 409, code: 'EMAIL_EXISTS' }),
    )

    await submitValidForm()

    expect(wrapper?.text()).toContain('邮箱已被注册')
    expect(router.currentRoute.value.name).toBe('register')
  })

  it('validates the form before calling the API', async () => {
    await setValue('username', '1x')
    await setValue('email', 'invalid')
    await setValue('new-password', 'short')
    await setValue('confirm-password', 'different')

    await wrapper?.find('form').trigger('submit')

    expect(wrapper?.text()).toContain('以字母开头')
    expect(wrapper?.text()).toContain('请输入有效的邮箱地址')
    expect(wrapper?.text()).toContain('两次输入的密码不一致')
    expect(context.api.register).not.toHaveBeenCalled()
  })
})
