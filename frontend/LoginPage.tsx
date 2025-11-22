import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/AuthContext'
import { HeartIcon, ShieldCheckIcon } from 'lucide-react'

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
    <div className="flex min-h-screen items-center justify-center p-6" style={{background: 'var(--chat-background)'}}>
      <div className="w-full max-w-md psychology-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center breathing-animation warm-glow">
            <HeartIcon className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">МойПсихолог</h1>
          <p className="text-muted-foreground">
            {mode === 'login' ? 'Добро пожаловать обратно' : 'Присоединяйтесь к нашему сообществу'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Имя пользователя</label>
            <input
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              placeholder="Введите ваше имя"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Пароль</label>
            <input
              type="password"
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              placeholder="Введите пароль"
            />
          </div>
          
          {(localError || error) && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {localError || error}
            </div>
          )}
          
          <Button 
            type="submit" 
            className={cn(
              'w-full calming-button text-base py-3 mt-6',
              loading && 'opacity-60 hover:scale-100'
            )} 
            disabled={loading}
          >
            {mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70 mb-4">
            <ShieldCheckIcon className="h-3 w-3" />
            <span>Конфиденциально и безопасно</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {mode === 'login' ? (
              <button 
                className="text-primary hover:text-primary/80 transition-colors duration-300" 
                onClick={() => setMode('register')}
              >
                Нет аккаунта? Зарегистрируйтесь
              </button>
            ) : (
              <button 
                className="text-primary hover:text-primary/80 transition-colors duration-300" 
                onClick={() => setMode('login')}
              >
                Уже есть аккаунт? Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage


