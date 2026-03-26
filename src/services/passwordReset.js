import { apiPost } from './axios'

const AUTH_API = '/api/auth'

export async function requestPasswordReset(email) {
  return apiPost(`${AUTH_API}/password/reset`, { email })
}

export default {
  requestPasswordReset
}
