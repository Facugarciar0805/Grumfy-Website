import type { AuthUser } from './types'

const API_URL = import.meta.env.VITE_API_URL || ''

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data as T
}

export interface CheckEmailResult {
  exists: boolean
}

export function checkEmail(email: string): Promise<CheckEmailResult> {
  return request('/user/check-email', { email })
}

export function register(data: {
  name: string
  email: string
  password: string
  phone: string
}): Promise<AuthUser> {
  return request('/user/register', data)
}

export function login(data: {
  email: string
  password: string
}): Promise<AuthUser> {
  return request('/user/login', data)
}
