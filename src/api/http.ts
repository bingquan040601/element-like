const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '')

export interface ApiFieldError {
  field: string
  message: string
}

interface ApiErrorOptions {
  status: number
  code: string
  requestId?: string
  details?: ApiFieldError[]
}

/** 统一后端业务错误与网络错误，UI 可读取 code / details 做字段级提示。 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId: string | undefined
  readonly details: ApiFieldError[]

  constructor(message: string, options: ApiErrorOptions) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.requestId = options.requestId
    this.details = options.details ?? []
  }
}

interface HttpClientConfig {
  getAccessToken?: () => string | null
  onUnauthorized?: (accessToken: string | null) => void
}

let getAccessToken: () => string | null = () => null
let onUnauthorized: ((accessToken: string | null) => void) | undefined

/** 在应用入口注入 Pinia token 和 401 处理，避免 HTTP 层反向依赖 Store / Router。 */
export const configureHttpClient = (config: HttpClientConfig): void => {
  getAccessToken = config.getAccessToken ?? (() => null)
  onUnauthorized = config.onUnauthorized
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** 请求体统一序列化为 JSON；GET 等无请求体的调用无需传入。 */
  body?: unknown
  /** false 用于登录 / 注册：不附加 token，也不触发全局 401 登出。 */
  auth?: boolean
  /** 显式 token 优先于全局 Provider。 */
  token?: string | null
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseApiError = (payload: unknown, status: number): ApiError => {
  const error = isRecord(payload) && isRecord(payload.error) ? payload.error : null
  const details = Array.isArray(error?.details)
    ? error.details.filter(
        (item): item is ApiFieldError =>
          isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string',
      )
    : []

  return new ApiError(
    typeof error?.message === 'string' ? error.message : `请求失败（HTTP ${status}）`,
    {
      status,
      code: typeof error?.code === 'string' ? error.code : 'UNKNOWN_ERROR',
      requestId: typeof error?.requestId === 'string' ? error.requestId : undefined,
      details,
    },
  )
}

/**
 * 统一请求入口：API 前缀、JSON、Bearer Token、标准响应拆包和错误转换。
 * 返回值直接是后端 success.data，业务层无需重复判断 HTTP / success。
 */
export const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, auth = true, token, headers, ...init } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  let accessToken: string | null = null
  if (auth) {
    accessToken = token ?? getAccessToken()
    if (accessToken) requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...init,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('无法连接服务器，请检查网络或后端服务', {
      status: 0,
      code: 'NETWORK_ERROR',
    })
  }

  if (response.status === 401 && auth) onUnauthorized?.(accessToken)

  let payload: unknown = null
  if (response.status !== 204) {
    try {
      payload = await response.json()
    } catch {
      throw new ApiError('服务器返回了无法解析的响应', {
        status: response.status,
        code: 'INVALID_RESPONSE',
      })
    }
  }

  if (response.ok && isRecord(payload) && payload.success === true && 'data' in payload) {
    return payload.data as T
  }
  if (response.status === 204 && response.ok) return undefined as T
  throw parseApiError(payload, response.status)
}
