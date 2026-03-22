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
  averageRating?: number
  averageRounded?: number
  count?: number
  ratingCount?: number
}

export interface RatingSummary {
  myRating?: number | null
  averageRounded?: number | null
  count?: number
  averageRating?: number
}

const RATINGS_API = '/api/ratings'

export default {
  async getByTruyen(truyenId: number): Promise<Rating[] | any> {
    return apiGet(`${RATINGS_API}/truyen/${truyenId}`)
  },

  async getAverage(truyenId: number): Promise<RatingAverage | any> {
    return apiGet(`${RATINGS_API}/truyen/${truyenId}/average`)
  },

  async getSummary(truyenId: number): Promise<RatingSummary | any> {
    return apiGet(`${RATINGS_API}/truyen/${truyenId}/summary`)
  },

  async rate(truyenId: number, ratingValue: number): Promise<RatingSummary | any> {
    return apiPost(`${RATINGS_API}/truyen/${truyenId}`, { ratingValue })
  },

  async remove(truyenId: number): Promise<RatingSummary | any> {
    return apiDelete(`${RATINGS_API}/truyen/${truyenId}`)
  }
}
