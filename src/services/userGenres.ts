import { apiGet, apiPost, apiDelete } from './axios'

export interface UserGenre {
  userId?: number
  genreId: number
}

const USER_GENRES_API = '/api/user-genres'

export default {
  async getMine(): Promise<UserGenre[] | any> {
    return apiGet(`${USER_GENRES_API}/me`)
  },

  async add(genreId: number): Promise<void> {
    return apiPost(`${USER_GENRES_API}/${genreId}`)
  },

  async remove(genreId: number): Promise<void> {
    return apiDelete(`${USER_GENRES_API}/${genreId}`)
  }
}
