import { apiGet, apiPost, apiDelete } from './axios'

export interface Rating {
  id?: number
  userId: number
  truyenId: number
  ratingValue: number
  createdAt?: string
}

export interface RatingAverage {
  truyenId: number
  averageRating: number
  ratingCount?: number
}

const RATINGS_API = '/api/ratings'

export default {
  async getByTruyen(truyenId: number): Promise<Rating[] | any> {
    return apiGet(`${RATINGS_API}/truyen/${truyenId}`)
  },

  async getAverage(truyenId: number): Promise<RatingAverage | any> {
    return apiGet(`${RATINGS_API}/truyen/${truyenId}/average`)
  },

  async rate(userId: number, truyenId: number, ratingValue: number): Promise<Rating> {
    return apiPost(RATINGS_API, {}, { params: { userId, truyenId, ratingValue } })
  },

  async remove(userId: number, truyenId: number): Promise<void> {
    return apiDelete(RATINGS_API, { userId, truyenId })
  }
}
