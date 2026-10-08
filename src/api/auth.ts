import api from './client'

export interface LoginResponse {
  success: boolean
  message?: string
  data?: {
    user: {
      id: number
      full_name: string
      email: string
      role: string
      avatar_url?: string
    }
    token: string
  }
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const res = await api.post('/auth/login', { email, password })
    return res.data
  } catch (e: any) {
    return {
      success: false,
      message: e.response?.data?.message || 'Erreur de connexion',
    }
  }
}

export async function getMe() {
  try {
    const res = await api.get('/auth/me')
    return res.data.data
  } catch {
    return null
  }
}