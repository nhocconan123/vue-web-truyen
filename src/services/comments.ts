import { apiGet, apiPost, apiDelete } from './axios'

export interface Comment {
  id?: number
  truyenId: number
  chapterId?: number
  content: string
  userId?: number
  username?: string
  avatar?: string
  createdAt?: string
}

const COMMENTS_API = '/api/comments'

export default {
  async getAll(params: {
    page?: number
    size?: number
    truyenId?: number
    chapterId?: number
  } = {}): Promise<Comment[] | any> {
    return apiGet(COMMENTS_API, params)
  },

  async create(data: Omit<Comment, 'id' | 'userId' | 'username' | 'createdAt'>): Promise<Comment> {
    return apiPost(COMMENTS_API, data)
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`${COMMENTS_API}/${id}`)
  }
}
