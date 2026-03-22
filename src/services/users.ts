import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './axios'

export interface UserProfile {
  id?: number
  username: string
  email?: string
  role?: string
  avatar?: string
  bio?: string
}

const USERS_API = '/api/users'

export default {
  async getAll(params: { page?: number; size?: number } = {}): Promise<UserProfile[] | any> {
    return apiGet(USERS_API, params)
  },

  async getById(id: number): Promise<UserProfile> {
    return apiGet(`${USERS_API}/${id}`)
  },

  async getMe(): Promise<UserProfile> {
    return apiGet(`${USERS_API}/me`)
  },

  async getSuggestions(size = 5): Promise<UserProfile[] | any> {
    return apiGet(`${USERS_API}/suggestions`, { size })
  },

  async create(data: UserProfile & { password?: string }): Promise<UserProfile> {
    return apiPost(USERS_API, data)
  },

  async update(id: number, data: Partial<UserProfile>): Promise<UserProfile> {
    return apiPut(`${USERS_API}/${id}`, data)
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`${USERS_API}/${id}`)
  },

  // Admin: update role only
  async adminUpdateRole(id: number, role: string): Promise<UserProfile> {
    return apiPatch(`/api/admin/users/${id}/role`, { role })
  },

  // Admin: update username and/or role
  async adminUpdate(id: number, data: { username?: string; role?: string }): Promise<UserProfile> {
    return apiPatch(`/api/admin/users/${id}`, data)
  }
}
