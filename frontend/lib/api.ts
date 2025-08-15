export type AuthResponse = {
  access_token: string
  token_type: string
}

// В dev через Vite-прокси используем префикс /api, в prod — можно задать VITE_API_URL
const API_URL = (import.meta as any)?.env?.VITE_API_URL ?? '/api'

function toFormUrlEncoded(payload: Record<string, string>): string {
  return Object.entries(payload)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/sign_in`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: toFormUrlEncoded({ username, password }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Ошибка входа (${res.status})`)
  }
  return res.json()
}

export async function registerUser(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok && res.status !== 201) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Ошибка регистрации (${res.status})`)
  }
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Не удалось получить профиль')
  return res.json()
}


