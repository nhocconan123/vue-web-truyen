import { apiGet, apiPost, apiDelete } from './axios'

export interface Follow {
  id?: number
  followerId?: number
  followingId: number
  createdAt?: string
}

const FOLLOWS_API = '/api/follows'

export default {
  async getFollowing(params: { page?: number; size?: number } = {}): Promise<Follow[] | any> {
    return apiGet(`${FOLLOWS_API}/me/following`, params)
  },

  async getFollowers(params: { page?: number; size?: number } = {}): Promise<Follow[] | any> {
    return apiGet(`${FOLLOWS_API}/me/followers`, params)
  },

  async follow(followingId: number): Promise<void> {
    return apiPost(`${FOLLOWS_API}/${followingId}`)
  },

  async unfollow(followingId: number): Promise<void> {
    return apiDelete(`${FOLLOWS_API}/${followingId}`)
  }
}
