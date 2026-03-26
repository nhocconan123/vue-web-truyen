import { apiPost } from './axios'

const ACCOUNT_API = '/api/account'

// These endpoints require a valid Bearer JWT (handled by axios interceptor)
export async function requestChangeOtp() {
  return apiPost(`${ACCOUNT_API}/password/change/otp`, {})
}

export async function confirmChangePassword(payload) {
  return apiPost(`${ACCOUNT_API}/password/change/confirm`, payload)
}

// Direct change password flow: currentPassword + newPassword (no OTP)
export async function changePassword(payload) {
  return apiPost(`${ACCOUNT_API}/password/change`, payload)
}

export default {
  requestChangeOtp,
  confirmChangePassword,
  changePassword
}
