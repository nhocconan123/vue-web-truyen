import axios from 'axios'
import auth from './auth'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8080'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Request interceptor: attach access token
api.interceptors.request.use(
  config => {
    const token = auth.getAccessToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor: handle 401 -> try refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config
    if (!originalRequest || !err.response) return Promise.reject(err)

    if (err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(e => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshUrl = `${API_BASE.replace(/\/$/, '')}/auth/refresh`
        const data = await auth.callRefreshToken(refreshUrl)
        // Expect response: { access_token, refresh_token }
        auth.setTokens({ accessToken: data.access_token, refreshToken: data.refresh_token })
        processQueue(null, data.access_token)
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        auth.clearTokens()
        // Optionally: emit global logout event here or navigate to /login
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  }
)

export default api

// Helper wrappers for common HTTP methods that return `data` or throw a normalized error
export async function apiGet(url, params = {}, config = {}) {
  try {
    const res = await api.get(url, { params, ...config })
    return res.data
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function apiPost(url, body = {}, config = {}) {
  try {
    const res = await api.post(url, body, config)
    return res.data
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function apiPut(url, body = {}, config = {}) {
  try {
    const res = await api.put(url, body, config)
    return res.data
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function apiPatch(url, body = {}, config = {}) {
  try {
    const res = await api.patch(url, body, config)
    return res.data
  } catch (e) {
    throw normalizeError(e)
  }
}

export async function apiDelete(url, params = {}, config = {}) {
  try {
    const res = await api.delete(url, { params, ...config })
    return res.data
  } catch (e) {
    throw normalizeError(e)
  }
}

function normalizeError(e) {
  // If the error is an axios error with response, return a simplified object
  if (e && e.response) {
    const { status, data } = e.response
    const message = data?.message || data?.error || (typeof data === 'string' ? data : e.message)
    const err = new Error(message || 'Request failed')
    err.status = status
    err.payload = data
    return err
  }
  return e
}
