import { flushPromises, mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/http'
import ElementLike from '@/bundle'
import { createAppRouter } from '@/router'
import { setupAuthTest } from '@/__tests__/helpers/auth'
import LoginView from '../LoginView.vue'

let wrapper: VueWrapper | undefined
let context: ReturnType<typeof setupAuthTest>

const mountLogin = async (redirect?: string): Promise<Router> => {
  const router = createAppRouter(createMemoryHistory())
  await router.push({ name: 'login', query: redirect ? { redirect } : {} })
  await router.isReady()
  wrapper = mount(LoginView, {
    global: { plugins: [context.pinia, router, ElementLike] },
  })
  return router
}

const submitValidForm = async () => {
  await wrapper?.find('input[name="account"]').setValue('huangbingquan')
  await wrapper?.find('input[name="password"]').setValue('password123')
  await wrapper?.find('form').trigger('submit')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    context = setupAuthTest()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('logs in and returns to the page requested before authentication', async () => {
    const router = await mountLogin('/button?section=basic')

    await submitValidForm()
    await vi.waitFor(() => {
      expect(router.currentRoute.value.fullPath).toBe('/button?section=basic')
    })

    expect(context.api.login).toHaveBeenCalledWith({
      account: 'huangbingquan',
      password: 'password123',
    })
    expect(context.authStore.isAuthenticated).toBe(true)
  })

  it('shakes only fields that fail required validation and can replay the animation', async () => {
    await mountLogin()
    await wrapper?.find('input[name="account"]').setValue('huangbingquan')
    await wrapper?.find('form').trigger('submit')
    await flushPromises()

    const password = wrapper?.find('input[name="password"]')
    expect(password?.classes()).toContain('is-shaking')
    expect(wrapper?.find('input[name="account"]').classes()).not.toContain('is-shaking')
    expect(context.api.login).not.toHaveBeenCalled()

    await password?.trigger('animationend')
    expect(password?.classes()).not.toContain('is-shaking')

    await wrapper?.find('form').trigger('submit')
    await flushPromises()
    expect(password?.classes()).toContain('is-shaking')
  })

  it('shows a service error and stays on login for invalid credentials', async () => {
    context.api.login.mockRejectedValue(
      new ApiError('账号或密码错误', { status: 401, code: 'INVALID_CREDENTIALS' }),
    )
    const router = await mountLogin()

    await submitValidForm()

    expect(wrapper?.find('[role="alert"]').text()).toBe('账号或密码错误')
    expect(router.currentRoute.value.name).toBe('login')
    expect(context.authStore.isAuthenticated).toBe(false)
  })

  it('ignores an external redirect target', async () => {
    const router = await mountLogin('https://example.com/phishing')

    await submitValidForm()
    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('icon')
    })
  })
})
