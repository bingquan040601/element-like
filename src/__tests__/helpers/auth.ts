import { createPinia, setActivePinia } from 'pinia'
import type { Pinia } from 'pinia'
import { vi } from 'vitest'
import { authService } from '@/features/auth'
import type { AuthPayload, User } from '@/features/auth'
import { useAuthStore } from '@/stores/auth'

export const mockUser: User = {
  id: '1',
  username: 'huangbingquan',
  email: 'timmy@example.com',
  nickname: 'Timmy',
  avatarUrl: null,
  createdAt: '2026-11-17T08:00:00.000Z',
  updatedAt: '2026-11-17T08:00:00.000Z',
}

export const mockAuthPayload: AuthPayload = {
  accessToken: 'test-token',
  tokenType: 'Bearer',
  expiresIn: 900,
  user: mockUser,
}

export const renewedAuthPayload: AuthPayload = {
  ...mockAuthPayload,
  accessToken: 'renewed-token',
  user: { ...mockUser, updatedAt: '2026-11-17T09:00:00.000Z' },
}

export const setupAuthTest = () => {
  localStorage.clear()
  sessionStorage.clear()
  const pinia: Pinia = createPinia()
  setActivePinia(pinia)
  const authStore = useAuthStore(pinia)
  const api = {
    login: vi.spyOn(authService, 'login').mockResolvedValue(mockAuthPayload),
    register: vi.spyOn(authService, 'register').mockResolvedValue(mockAuthPayload),
    getCurrentUser: vi.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser),
    changePassword: vi.spyOn(authService, 'changePassword').mockResolvedValue(renewedAuthPayload),
  }
  const login = () =>
    authStore.login({ account: mockUser.username, password: 'password123', remember: false })

  return { pinia, authStore, api, login }
}
