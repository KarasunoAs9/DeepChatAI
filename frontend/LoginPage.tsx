import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/AuthContext'

type Mode = 'login' | 'register'

const LoginPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { signIn, signUp, error, loading } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    try {
      if (mode === 'login') {
        await signIn(username, password)
      } else {
        await signUp(username, password)
      }
      onSuccess()
    } catch (e: any) {
      setLocalError(e?.message ?? 'Ошибка')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-gray-900">DeepChatAI</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Username</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {(localError || error) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {localError || error}
            </div>
          )}
          <Button type="submit" className={cn('w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg', loading && 'opacity-60')} disabled={loading}>
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <button className="text-blue-600 hover:underline" onClick={() => setMode('register')}>Нет аккаунта? Зарегистрируйтесь</button>
          ) : (
            <button className="text-blue-600 hover:underline" onClick={() => setMode('login')}>Уже есть аккаунт? Войти</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage


