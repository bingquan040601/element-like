import type { User } from './types'

const SESSION_STORAGE_KEY = 'element-like.auth.session.v2'

export interface AuthSession {
  accessToken: string
  tokenType: 'Bearer'
  expiresAt: number
  user: User
}

export interface RestoredAuthSession extends AuthSession {
  remember: boolean
}

type StorageType = 'localStorage' | 'sessionStorage'

const getStorage = (type: StorageType): Storage | null => {
  if (typeof window === 'undefined') return null
  try {
    return window[type]
  } catch {
    return null
  }
}

const removeSession = (type: StorageType): void => {
  try {
    getStorage(type)?.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Storage 被浏览器禁用时，内存中的 Pinia 状态仍可正常清理。
  }
}

export const clearAuthSession = (): void => {
  removeSession('localStorage')
  removeSession('sessionStorage')
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isUser = (value: unknown): value is User => {
  if (!isRecord(value)) return false
  return (
    ['id', 'username', 'email', 'nickname', 'createdAt', 'updatedAt'].every(
      (field) => typeof value[field] === 'string',
    ) &&
    (value.avatarUrl === null || typeof value.avatarUrl === 'string')
  )
}

const isSession = (value: unknown): value is AuthSession =>
  isRecord(value) &&
  typeof value.accessToken === 'string' &&
  value.tokenType === 'Bearer' &&
  typeof value.expiresAt === 'number' &&
  isUser(value.user)

const readSession = (type: StorageType, remember: boolean): RestoredAuthSession | null => {
  try {
    const raw = getStorage(type)?.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const session: unknown = JSON.parse(raw)
    if (!isSession(session) || session.expiresAt <= Date.now()) {
      removeSession(type)
      return null
    }
    return { ...session, remember }
  } catch {
    removeSession(type)
    return null
  }
}

export const restoreAuthSession = (): RestoredAuthSession | null =>
  readSession('localStorage', true) ?? readSession('sessionStorage', false)

export const saveAuthSession = (session: AuthSession, remember: boolean): void => {
  clearAuthSession()
  const type: StorageType = remember ? 'localStorage' : 'sessionStorage'
  try {
    getStorage(type)?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // 登录仍由 Pinia 在当前页面生效；刷新后需要重新登录。
  }
}
