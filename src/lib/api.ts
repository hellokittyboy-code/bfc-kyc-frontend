import { getToken } from './auth'

export type ApiOk<T> = { code: number; msg: string; data: T; succeed: true; req_id?: string }
export type ApiFail = { code: number; msg: string; data: unknown; succeed: false; req_id?: string }
export type ApiResponse<T> = ApiOk<T> | ApiFail

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export function apiBase() {
  const envBase = import.meta.env.VITE_API_BASE
  return (envBase || '').replace(/\/+$/, '')
}

async function parseJsonSafe(res: Response) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function isApiOk<T>(v: unknown): v is ApiOk<T> {
  return (
    typeof v === 'object' &&
    v !== null &&
    'succeed' in v &&
    (v as Record<string, unknown>).succeed === true &&
    'data' in v &&
    'code' in v &&
    typeof (v as Record<string, unknown>).code === 'number'
  )
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers = new Headers(init?.headers || {})
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers })
  const body = await parseJsonSafe(res)
  if (!res.ok) {
    const msg = (() => {
      if (typeof body === 'object' && body) {
        if ('msg' in body) {
          const v = (body as Record<string, unknown>).msg
          if (typeof v === 'string') return v
        }
      }
      return `HTTP ${res.status}`
    })()
    throw new ApiError(msg, res.status, body)
  }
  if (typeof body === 'object' && body && 'succeed' in body) {
    if (!isApiOk<T>(body)) {
      const message =
        typeof body === 'object' && body && 'msg' in body
          ? String((body as Record<string, unknown>).msg || 'request failed')
          : 'request failed'
      throw new ApiError(message, res.status, body)
    }
    return body.data
  }
  return body as T
}
