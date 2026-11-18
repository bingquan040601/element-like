import { flushPromises, mount } from '@vue/test-utils'
import type { DOMWrapper, VueWrapper } from '@vue/test-utils'
import { createMemoryHistory } from 'vue-router'
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ElementLike from '@/bundle'
import { createAppRouter } from '@/router'
import { setupAuthTest } from '@/__tests__/helpers/auth'
import UserMenu from '../UserMenu.vue'

let wrapper: VueWrapper | undefined
let router: Router
let context: ReturnType<typeof setupAuthTest>

const openMenu = async () => {
  await wrapper?.find('.user-menu__trigger').trigger('click')
  await flushPromises()
}

const selectOption = async (label: string) => {
  const option = wrapper
    ?.findAll('.el-like-dropdown-menu__action')
    .find((item: DOMWrapper<Element>) => item.text().includes(label))
  expect(option, `menu option: ${label}`).toBeDefined()
  await option?.trigger('click')
  await flushPromises()
}

describe('UserMenu', () => {
  beforeEach(async () => {
    context = setupAuthTest()
    await context.login()
    router = createAppRouter(createMemoryHistory())
    await router.push('/icon')
    await router.isReady()
    wrapper = mount(UserMenu, {
      global: { plugins: [context.pinia, router, ElementLike], stubs: { teleport: true } },
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
    vi.restoreAllMocks()
  })

  it('opens the personal information dialog', async () => {
    await openMenu()
    await selectOption('个人信息')

    expect(wrapper?.find('.el-like-dialog__title').text()).toBe('个人信息')
    expect(wrapper?.text()).toContain('timmy@example.com')
    expect(wrapper?.text()).toContain('Timmy')
  })

  it('opens the change password dialog', async () => {
    await openMenu()
    await selectOption('修改密码')

    expect(wrapper?.find('.el-like-dialog__title').text()).toBe('修改密码')
    expect(wrapper?.find('input[name="current-password"]').exists()).toBe(true)
    expect(wrapper?.find('input[name="confirm-password"]').exists()).toBe(true)
  })

  it.each(['个人信息', '修改密码'])('keeps the %s dialog open on overlay click', async (title) => {
    await openMenu()
    await selectOption(title)

    await wrapper?.find('.el-like-dialog__overlay').trigger('click')

    expect(wrapper?.find('.el-like-dialog__title').text()).toBe(title)
  })

  it('logs out and returns to login with the current page as redirect', async () => {
    await openMenu()
    await selectOption('退出登录')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('login')
    })
    expect(router.currentRoute.value.query.redirect).toBe('/icon')
    expect(context.authStore.isAuthenticated).toBe(false)
  })
})
