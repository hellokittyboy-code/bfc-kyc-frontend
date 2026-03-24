import { createContext } from 'react'

import { decodeJwt } from '../lib/auth'

export type AuthState = {
  token: string
  subject: string
  role: string
  userId: string
}

export type AuthContextValue = {
  auth: AuthState
  login: (token: string) => void
  logout: () => void
  isExpired: boolean
}

export function buildAuthState(token: string): AuthState {
  const payload = token ? decodeJwt(token) : null
  return {
    token,
    subject: payload?.sub || '',
    role: payload?.role || '',
    userId: payload?.userId || '',
  }
}

export function isTokenExpired(token: string) {
  const payload = token ? decodeJwt(token) : null
  const exp = payload?.exp
  if (!exp) return false
  return Date.now() >= exp * 1000
}

export const AuthContext = createContext<AuthContextValue | null>(null)

