import { request } from '@/api/http'
import type {
  AuthPayload,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
  User,
} from '../types'
import type { AuthService } from './authService'

const login = (payload: LoginPayload): Promise<AuthPayload> =>
  request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })

const register = (payload: RegisterPayload): Promise<AuthPayload> =>
  request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })

const getCurrentUser = async (accessToken: string): Promise<User> => {
  const data = await request<{ user: User }>('/users/me', { token: accessToken })
  return data.user
}

const updateProfile = async (accessToken: string, payload: UpdateProfilePayload): Promise<User> => {
  const data = await request<{ user: User }>('/users/me', {
    method: 'PATCH',
    body: payload,
    token: accessToken,
  })
  return data.user
}

const changePassword = (
  accessToken: string,
  payload: ChangePasswordPayload,
): Promise<AuthPayload> =>
  request<AuthPayload>('/auth/change-password', {
    method: 'POST',
    body: payload,
    token: accessToken,
  })

export const apiAuthService: AuthService = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
}
