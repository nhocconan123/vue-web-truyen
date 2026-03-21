import { apiGet, apiPost, apiPut, apiDelete } from './axios'

const GENRES_API = '/api/genres'

export default {
  // Get all genres
  async getAll() {
    return apiGet(GENRES_API)
  },

  // Get a single genre by ID
  async getById(id) {
    return apiGet(`${GENRES_API}/${id}`)
  },

  // Create a new genre
  async create(data) {
    return apiPost(GENRES_API, data)
  },

  // Update a genre
  async update(id, data) {
    return apiPut(`${GENRES_API}/${id}`, data)
  },

  // Delete a genre
  async delete(id) {
    return apiDelete(`${GENRES_API}/${id}`)
  }
}
