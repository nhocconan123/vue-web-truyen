import { apiGet, apiPost, apiPut, apiDelete } from './axios'

export interface Genre {
  id?: number
  name: string
  slug: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE'
}

const GENRES_API = '/api/genres'

export default {
  // Get all genres
  async getAll(): Promise<Genre[]> {
    return apiGet(GENRES_API)
  },

  // Get a single genre by ID
  async getById(id: number): Promise<Genre> {
    return apiGet(`${GENRES_API}/${id}`)
  },

  // Get a single genre by slug
  async getBySlug(slug: string): Promise<Genre> {
    return apiGet(`${GENRES_API}/slug/${slug}`)
  },

  // Create a new genre
  async create(data: Omit<Genre, 'id'>): Promise<Genre> {
    return apiPost(GENRES_API, data)
  },

  // Update a genre
  async update(id: number, data: Partial<Genre>): Promise<Genre> {
    return apiPut(`${GENRES_API}/${id}`, data)
  },

  // Delete a genre
  async delete(id: number): Promise<void> {
    return apiDelete(`${GENRES_API}/${id}`)
  }
}
