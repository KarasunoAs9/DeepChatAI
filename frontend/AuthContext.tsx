import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as apiLogin, registerUser, getMe, type AuthResponse } from '@/lib/api'

type AuthState = {
  token: string | null
  user: { username: string } | null
  loading: boolean
  error: string | null
}

type AuthContextType = AuthState & {
  signIn: (username: string, password: string) => Promise<void>
  signUp: (username: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'deepchatai_token'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, user: null, loading: true, error: null })

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setState((s) => ({ ...s, loading: false }))
      return
    }
    ;(async () => {
      try {
        const me = await getMe(token)
        setState({ token, user: { username: me.username }, loading: false, error: null })
      } catch (e) {
        localStorage.removeItem(TOKEN_KEY)
        setState({ token: null, user: null, loading: false, error: null })
      }
    })()
  }, [])

  const signIn = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, error: null, loading: true }))
    try {
      const res: AuthResponse = await apiLogin(username, password)
      localStorage.setItem(TOKEN_KEY, res.access_token)
      const me = await getMe(res.access_token)
      setState({ token: res.access_token, user: { username: me.username }, loading: false, error: null })
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e?.message ?? 'Ошибка входа' }))
      throw e
    }
  }, [])

  const signUp = useCallback(async (username: string, password: string) => {
    setState((s) => ({ ...s, error: null, loading: true }))
    try {
      await registerUser(username, password)
      await signIn(username, password)
    } catch (e: any) {
      setState((s) => ({ ...s, loading: false, error: e?.message ?? 'Ошибка регистрации' }))
      throw e
    }
  }, [signIn])

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setState({ token: null, user: null, loading: false, error: null })
  }, [])

  const value = useMemo<AuthContextType>(
    () => ({ ...state, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


