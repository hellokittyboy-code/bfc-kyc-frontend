export type JwtPayload = {
  sub?: string
  role?: string
  userId?: string
  exp?: number
  iat?: number
}

function base64UrlToBase64(input: string) {
  return input.replace(/-/g, '+').replace(/_/g, '/')
}

export function decodeJwt(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = parts[1]
    const json = atob(base64UrlToBase64(payload))
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

const TOKEN_KEY = 'kyc_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getIdentity() {
  const token = getToken()
  const payload = token ? decodeJwt(token) : null
  return {
    token,
    subject: payload?.sub || '',
    role: payload?.role || '',
    userId: payload?.userId || '',
  }
}
