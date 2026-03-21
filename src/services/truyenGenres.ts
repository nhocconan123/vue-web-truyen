import { apiGet, apiPost, apiDelete } from './axios'

export interface TruyenGenre {
  truyenId: number
  genreId: number
}

const TRUYEN_GENRES_API = '/api/truyen-genres'

export default {
  async getByTruyen(truyenId: number): Promise<TruyenGenre[] | any> {
    return apiGet(`${TRUYEN_GENRES_API}/truyen/${truyenId}`)
  },

  async add(truyenId: number, genreId: number): Promise<void> {
    return apiPost(TRUYEN_GENRES_API, {}, { params: { truyenId, genreId } })
  },

  async remove(truyenId: number, genreId: number): Promise<void> {
    return apiDelete(TRUYEN_GENRES_API, { truyenId, genreId })
  }
}
