import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.vue'
import ElementLike from '../bundle'
import { createAppRouter } from '../router'
import { setupAuthTest } from './helpers/auth'

let wrapper: VueWrapper | undefined
let context: ReturnType<typeof setupAuthTest>

describe('App', () => {
  beforeEach(() => {
    context = setupAuthTest()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('renders navigation and the user menu for an authenticated user', async () => {
    await context.login()
    const router = createAppRouter(createMemoryHistory())
    await router.push('/icon')
    await router.isReady()

    wrapper = mount(App, {
      global: { plugins: [context.pinia, router, ElementLike] },
    })

    expect(wrapper.text()).toContain('Button')
    expect(wrapper.text()).toContain('Icon')
    expect(wrapper.find('.user-menu__trigger').exists()).toBe(true)
    expect(wrapper.find('.user-menu__name').text()).toBe('Timmy')
  })

  it('uses the blank layout without navigation on the login page', async () => {
    const router = createAppRouter(createMemoryHistory())
    await router.push('/login')
    await router.isReady()

    wrapper = mount(App, {
      global: { plugins: [context.pinia, router, ElementLike] },
    })

    expect(wrapper.find('.app-header').exists()).toBe(false)
    expect(wrapper.find('.auth-card h1').text()).toBe('欢迎回来')
  })
})
