export interface User {
  id: string
  username: string
  email: string
  nickname: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

/** 后端登录 / 注册成功时返回的统一鉴权数据。 */
export interface AuthPayload {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}

export interface LoginPayload {
  account: string
  password: string
}

export interface LoginCredentials extends LoginPayload {
  /** true 持久化到 localStorage，false 仅保留在当前标签页。 */
  remember: boolean
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface RegisterCredentials extends RegisterPayload {
  remember: boolean
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}
