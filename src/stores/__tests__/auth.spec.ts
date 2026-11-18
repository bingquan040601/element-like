import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockUser, setupAuthTest } from '@/__tests__/helpers/auth'

let context: ReturnType<typeof setupAuthTest>

describe('auth store', () => {
  beforeEach(() => {
    context = setupAuthTest()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('stores login data in Pinia and persists a remembered session', async () => {
    await context.authStore.login({
      account: '  huangbingquan  ',
      password: 'password123',
      remember: true,
    })

    expect(context.authStore.user).toEqual(mockUser)
    expect(context.authStore.accessToken).toBe('test-token')
    expect(context.authStore.isAuthenticated).toBe(true)
    expect(localStorage.getItem('element-like.auth.session.v2')).toContain('test-token')
    expect(sessionStorage.getItem('element-like.auth.session.v2')).toBeNull()
    expect(context.api.login).toHaveBeenCalledWith({
      account: 'huangbingquan',
      password: 'password123',
    })
  })

  it('normalizes registration data and omits an empty nickname', async () => {
    await context.authStore.register({
      username: '  huangbingquan ',
      email: ' TIMMY@EXAMPLE.COM ',
      password: 'password123',
      nickname: '   ',
      remember: false,
    })

    expect(context.api.register).toHaveBeenCalledWith({
      username: 'huangbingquan',
      email: 'timmy@example.com',
      password: 'password123',
    })
  })

  it('refreshes the current user through the users/me service', async () => {
    await context.login()
    context.api.getCurrentUser.mockResolvedValue({ ...mockUser, nickname: 'Updated' })

    await context.authStore.fetchCurrentUser()

    expect(context.api.getCurrentUser).toHaveBeenCalledWith('test-token')
    expect(context.authStore.user?.nickname).toBe('Updated')
    expect(context.authStore.profileLoaded).toBe(true)
  })

  it('normalizes and persists editable profile fields', async () => {
    await context.login()
    const updatedUser = {
      ...mockUser,
      nickname: 'Updated',
      email: 'updated@example.com',
      updatedAt: '2026-11-17T09:00:00.000Z',
    }
    context.api.updateProfile.mockResolvedValue(updatedUser)

    await context.authStore.updateProfile({
      nickname: '  Updated  ',
      email: ' UPDATED@EXAMPLE.COM ',
    })

    expect(context.api.updateProfile).toHaveBeenCalledWith('test-token', {
      nickname: 'Updated',
      email: 'updated@example.com',
    })
    expect(context.authStore.user).toEqual(updatedUser)
    expect(sessionStorage.getItem('element-like.auth.session.v2')).toContain('updated@example.com')
  })

  it('replaces the old token and persisted session after a password change', async () => {
    await context.login()

    await context.authStore.changePassword({
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    })

    expect(context.api.changePassword).toHaveBeenCalledWith('test-token', {
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    })
    expect(context.authStore.accessToken).toBe('renewed-token')
    expect(sessionStorage.getItem('element-like.auth.session.v2')).toContain('renewed-token')
    expect(sessionStorage.getItem('element-like.auth.session.v2')).not.toContain('test-token')
  })

  it('ignores a users/me response that arrives after logout', async () => {
    let resolveUser: ((user: typeof mockUser) => void) | undefined
    context.api.getCurrentUser.mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve
      }),
    )
    await context.login()

    const request = context.authStore.fetchCurrentUser()
    context.authStore.logout()
    resolveUser?.({ ...mockUser, nickname: 'Stale' })
    await request

    expect(context.authStore.user).toBeNull()
    expect(context.authStore.accessToken).toBeNull()
    expect(context.authStore.profileLoaded).toBe(false)
  })

  it('clears all authentication state on logout', async () => {
    await context.login()

    context.authStore.logout()

    expect(context.authStore.user).toBeNull()
    expect(context.authStore.accessToken).toBeNull()
    expect(context.authStore.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem('element-like.auth.session.v2')).toBeNull()
  })
})
