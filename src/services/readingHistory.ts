import { apiGet, apiPost, apiDelete } from './axios'

export interface ReadingHistory {
  id?: number
  chapterId: number
  truyenId?: number
  lastReadAt?: string
}

const READING_HISTORY_API = '/api/reading-history'

export default {
  async getMine(params: { page?: number; size?: number } = {}): Promise<ReadingHistory[] | any> {
    return apiGet(`${READING_HISTORY_API}/me`, params)
  },

  async upsert(chapterId: number): Promise<void> {
    return apiPost(`${READING_HISTORY_API}/${chapterId}`)
  },

  async remove(chapterId: number): Promise<void> {
    return apiDelete(`${READING_HISTORY_API}/${chapterId}`)
  }
}
