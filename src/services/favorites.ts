import { apiGet, apiPost, apiDelete } from './axios'

export interface Favorite {
  id?: number
  truyenId: number
  createdAt?: string
}

const FAVORITES_API = '/api/favorites'

export default {
  async getMine(params: { page?: number; size?: number } = {}): Promise<Favorite[] | any> {
    return apiGet(`${FAVORITES_API}/me`, params)
  },

  async add(truyenId: number): Promise<void> {
    return apiPost(`${FAVORITES_API}/${truyenId}`)
  },

  async remove(truyenId: number): Promise<void> {
    return apiDelete(`${FAVORITES_API}/${truyenId}`)
  }
}
