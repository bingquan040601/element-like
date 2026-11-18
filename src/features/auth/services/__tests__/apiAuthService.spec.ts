import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureHttpClient } from '@/api/http'
import { mockAuthPayload, mockUser } from '@/__tests__/helpers/auth'
import { apiAuthService } from '../apiAuthService'

const fetchMock = vi.fn<typeof fetch>()
const onUnauthorized = vi.fn<(accessToken: string | null) => void>()

const jsonResponse = (status: number, payload: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn<() => Promise<unknown>>().mockResolvedValue(payload),
  }) as unknown as Response

const success = (data: unknown) => jsonResponse(200, { success: true, data })

const getCall = (index = 0): [string, RequestInit] =>
  fetchMock.mock.calls[index] as unknown as [string, RequestInit]

describe('apiAuthService', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    onUnauthorized.mockReset()
    vi.stubGlobal('fetch', fetchMock)
    configureHttpClient({ getAccessToken: () => 'stored-token', onUnauthorized })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts login credentials without attaching a token', async () => {
    fetchMock.mockResolvedValue(success(mockAuthPayload))

    await expect(
      apiAuthService.login({ account: 'huangbingquan', password: 'password123' }),
    ).resolves.toEqual(mockAuthPayload)

    const [url, init] = getCall()
    expect(url).toBe('/api/v1/auth/login')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      account: 'huangbingquan',
      password: 'password123',
    })
    const headers = new Headers(init.headers)
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Authorization')).toBeNull()
  })

  it('gets the current user with a Bearer token', async () => {
    fetchMock.mockResolvedValue(success({ user: mockUser }))

    await expect(apiAuthService.getCurrentUser('current-token')).resolves.toEqual(mockUser)

    const [url, init] = getCall()
    expect(url).toBe('/api/v1/users/me')
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer current-token')
  })

  it('posts oldPassword/newPassword and returns the renewed session', async () => {
    fetchMock.mockResolvedValue(success(mockAuthPayload))

    await expect(
      apiAuthService.changePassword('current-token', {
        oldPassword: 'oldpassword123',
        newPassword: 'newpassword456',
      }),
    ).resolves.toEqual(mockAuthPayload)

    const [url, init] = getCall()
    expect(url).toBe('/api/v1/auth/change-password')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      oldPassword: 'oldpassword123',
      newPassword: 'newpassword456',
    })
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer current-token')
  })

  it('preserves standard API error codes and field details', async () => {
    const details = [{ field: 'newPassword', message: '密码长度至少为 8 位' }]
    fetchMock.mockResolvedValue(
      jsonResponse(400, {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: '请求参数不合法', details },
      }),
    )

    await expect(
      apiAuthService.changePassword('current-token', {
        oldPassword: 'oldpassword123',
        newPassword: 'short',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR', details })
  })

  it('notifies 401 handling for protected requests but not for login', async () => {
    const unauthorized = jsonResponse(401, {
      success: false,
      error: { code: 'TOKEN_EXPIRED', message: 'token 已过期' },
    })
    fetchMock.mockResolvedValueOnce(unauthorized)
    await expect(apiAuthService.getCurrentUser('expired-token')).rejects.toMatchObject({
      code: 'TOKEN_EXPIRED',
    })
    expect(onUnauthorized).toHaveBeenCalledOnce()

    fetchMock.mockResolvedValueOnce(unauthorized)
    await expect(
      apiAuthService.login({ account: 'nobody', password: 'incorrect' }),
    ).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' })
    expect(onUnauthorized).toHaveBeenCalledOnce()
  })
})
