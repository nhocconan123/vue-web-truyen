// Lightweight token helper used by axios instance and stores
const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export async function callRefreshToken(refreshUrl) {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('no_refresh_token')
  const res = await fetch(refreshUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  })
  if (!res.ok) throw new Error('refresh_failed')
  return res.json()
}

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  callRefreshToken
}
