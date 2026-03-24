import { useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import { clearToken, getToken, setToken } from '../lib/auth'
import { AuthContext, buildAuthState, isTokenExpired } from './authContext'

export function AuthProvider(props: PropsWithChildren) {
  const [token, setTokenState] = useState(() => getToken())

  const auth = useMemo(() => buildAuthState(token), [token])
  const expired = useMemo(() => isTokenExpired(token), [token])

  const value = useMemo(
    () => ({
      auth,
      isExpired: expired,
      login: (t: string) => {
        setToken(t)
        setTokenState(t)
      },
      logout: () => {
        clearToken()
        setTokenState('')
      },
    }),
    [auth, expired],
  )

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}
