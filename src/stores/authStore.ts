import { create } from 'zustand'

export interface AdminUser {
  id: number
  full_name: string
  email: string
  role: string
  avatar_url?: string
}

interface AuthState {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (user: AdminUser, token: string) => void
  logout: () => void
  loadFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem('admin_user', JSON.stringify(user))
    localStorage.setItem('admin_token', token)
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: ['admin', 'super_admin'].includes(user.role),
      isLoading: false,
    })
  },

  logout: () => {
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
    })
  },

  loadFromStorage: () => {
    try {
      const storedUser = localStorage.getItem('admin_user')
      const storedToken = localStorage.getItem('admin_token')

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser)
        set({
          user,
          token: storedToken,
          isAuthenticated: true,
          isAdmin: ['admin', 'super_admin'].includes(user.role),
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))