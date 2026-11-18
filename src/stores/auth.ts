import { defineStore } from 'pinia'
import { ApiError } from '@/api/http'
import { clearAuthSession, restoreAuthSession, saveAuthSession } from '@/features/auth/authStorage'
import { authService } from '@/features/auth/services/authService'
import type {
  AuthPayload,
  ChangePasswordPayload,
  LoginCredentials,
  RegisterCredentials,
  RegisterPayload,
  User,
} from '@/features/auth/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  tokenType: 'Bearer'
  expiresAt: number | null
  remember: boolean
  /** 当前会话是否已通过 /users/me 获取过最新资料。 */
  profileLoaded: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const session = restoreAuthSession()
    return {
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      tokenType: 'Bearer',
      expiresAt: session?.expiresAt ?? null,
      remember: session?.remember ?? false,
      profileLoaded: false,
    }
  },

  getters: {
    isAuthenticated: (state) =>
      Boolean(
        state.accessToken && state.user && state.expiresAt !== null && state.expiresAt > Date.now(),
      ),
  },

  actions: {
    persistSession() {
      if (!this.accessToken || !this.user || this.expiresAt === null) return
      saveAuthSession(
        {
          accessToken: this.accessToken,
          tokenType: this.tokenType,
          expiresAt: this.expiresAt,
          user: this.user,
        },
        this.remember,
      )
    },

    setSession(payload: AuthPayload, remember: boolean) {
      this.user = payload.user
      this.accessToken = payload.accessToken
      this.tokenType = payload.tokenType
      this.expiresAt = Date.now() + payload.expiresIn * 1000
      this.remember = remember
      this.profileLoaded = false
      this.persistSession()
    },

    clearSession() {
      this.user = null
      this.accessToken = null
      this.expiresAt = null
      this.remember = false
      this.profileLoaded = false
      clearAuthSession()
    },

    async login({ remember, ...credentials }: LoginCredentials) {
      const payload = await authService.login({
        account: credentials.account.trim(),
        password: credentials.password,
      })
      this.setSession(payload, remember)
      return payload.user
    },

    async register({ remember, ...credentials }: RegisterCredentials) {
      const payload: RegisterPayload = {
        username: credentials.username.trim(),
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }
      const nickname = credentials.nickname?.trim()
      if (nickname) payload.nickname = nickname

      const authPayload = await authService.register(payload)
      this.setSession(authPayload, remember)
      return authPayload.user
    },

    async fetchCurrentUser() {
      if (!this.accessToken) {
        throw new ApiError('请先登录', { status: 401, code: 'UNAUTHORIZED' })
      }
      const accessToken = this.accessToken
      try {
        const user = await authService.getCurrentUser(accessToken)
        if (this.accessToken !== accessToken) return user
        this.user = user
        this.profileLoaded = true
        this.persistSession()
        return user
      } catch (error) {
        if (error instanceof ApiError && error.status === 401 && this.accessToken === accessToken) {
          this.clearSession()
        }
        throw error
      }
    },

    async changePassword(payload: ChangePasswordPayload) {
      if (!this.accessToken) {
        throw new ApiError('请先登录', { status: 401, code: 'UNAUTHORIZED' })
      }
      const accessToken = this.accessToken
      const authPayload = await authService.changePassword(accessToken, payload)
      if (this.accessToken !== accessToken) return
      // 后端会使所有旧 token 失效，必须立即替换整条会话，而不是只更新密码。
      this.setSession(authPayload, this.remember)
      this.profileLoaded = true
    },

    logout() {
      this.clearSession()
    },
  },
})
