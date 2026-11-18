import type {
  AuthPayload,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types'
import { apiAuthService } from './apiAuthService'

/** 鉴权 API 契约，Store 只依赖该接口，不直接处理 fetch 和响应结构。 */
export interface AuthService {
  login: (payload: LoginPayload) => Promise<AuthPayload>
  register: (payload: RegisterPayload) => Promise<AuthPayload>
  getCurrentUser: (accessToken: string) => Promise<User>
  changePassword: (accessToken: string, payload: ChangePasswordPayload) => Promise<AuthPayload>
}

export const authService: AuthService = apiAuthService
