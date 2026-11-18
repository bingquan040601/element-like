import { createMemoryHistory } from 'vue-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupAuthTest } from '@/__tests__/helpers/auth'
import { createAppRouter } from '../index'

let context: ReturnType<typeof setupAuthTest>

describe('router authentication guard', () => {
  beforeEach(() => {
    context = setupAuthTest()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects an anonymous visitor to login and preserves the full target', async () => {
    const router = createAppRouter(createMemoryHistory())

    await router.push('/button?section=basic')

    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/button?section=basic')
  })

  it('allows authenticated navigation and redirects away from public auth pages', async () => {
    await context.login()
    const router = createAppRouter(createMemoryHistory())

    await router.push('/button')
    expect(router.currentRoute.value.name).toBe('button')

    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('icon')

    await router.push('/register')
    expect(router.currentRoute.value.name).toBe('icon')
  })

  it('clears an expired token before guarding the route', async () => {
    await context.login()
    context.authStore.expiresAt = Date.now() - 1
    const router = createAppRouter(createMemoryHistory())

    await router.push('/button')

    expect(router.currentRoute.value.name).toBe('login')
    expect(context.authStore.accessToken).toBeNull()
  })
})
