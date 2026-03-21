import { defineStore } from 'pinia'
import api from '../services/axios'
import auth from '../services/auth'
import router from '../router'
import usersService, { type UserProfile } from '../services/users'

export interface User {
  id?: string | number
  username: string
  email?: string
  role?: string
  avatar?: string
  bio?: string
  tokenType?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  access_token?: string
  accessToken?: string
  token?: string
  refresh_token?: string
  refreshToken?: string
  user?: User
  userId?: string | number
  username?: string
  role?: string
  tokenType?: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  avatar?: string
  bio?: string
}

const USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: (() => {
      try {
        const raw = localStorage.getItem(USER_KEY)
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    })(),
    isAuthenticated: !!auth.getAccessToken(),
    loading: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isUser: (state) => state.user?.role === 'USER',
    hasAuth: (state) => state.isAuthenticated
  },

  actions: {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      this.loading = true
      try {
        const res = await api.post<LoginResponse>('/api/auth/login', credentials)
        const data = res.data || {}

        const accessToken = data.access_token || data.accessToken || data.token
        const refreshToken = data.refresh_token || data.refreshToken || null

        if (!accessToken) {
          throw new Error('No access token in response')
        }

        auth.setTokens({ accessToken, refreshToken: refreshToken || undefined })

        this.user = data.user || {
          id: data.userId,
          username: data.username || credentials.username,
          role: data.role,
          tokenType: data.tokenType
        }

        this.isAuthenticated = true
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        return data
      } catch (e) {
        this.isAuthenticated = false
        this.user = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async register(payload: RegisterPayload): Promise<LoginResponse> {
      this.loading = true
      try {
        const res = await api.post<LoginResponse>('/api/auth/register', payload)
        const data = res.data || {}

        const accessToken = data.access_token || data.accessToken || data.token
        if (!accessToken) {
          throw new Error('No access token in response')
        }

        auth.setTokens({ accessToken })
        this.user = data.user || {
          id: data.userId,
          username: data.username || payload.username,
          role: data.role,
          tokenType: data.tokenType,
          email: payload.email,
          avatar: payload.avatar,
          bio: payload.bio
        }
        this.isAuthenticated = true
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        return data
      } catch (e) {
        this.isAuthenticated = false
        this.user = null
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchMe(): Promise<UserProfile | null> {
      if (!this.isAuthenticated) return null
      try {
        const me = await usersService.getMe()
        this.user = {
          id: me.id,
          username: me.username,
          email: me.email,
          role: me.role,
          avatar: me.avatar,
          bio: me.bio
        }
        localStorage.setItem(USER_KEY, JSON.stringify(this.user))
        return me
      } catch (e) {
        return null
      }
    },

    logout(): void {
      auth.clearTokens()
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem(USER_KEY)
      router.push('/login')
    },

    setUser(user: User): void {
      this.user = user
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    },

    clearAuth(): void {
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem(USER_KEY)
    }
  }
})
