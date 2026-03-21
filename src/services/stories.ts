import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './axios'

export interface Story {
  id?: number
  title: string
  slug?: string
  description?: string
  coverImage?: string
  publishStatus: 'ONGOING' | 'COMPLETED' | 'PAUSED'
  status?: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedAt?: string
  createdAt?: string
  updatedAt?: string
  author?: string
  authorName?: string
  authorId?: number
  genreIds?: number[]
}

export interface Chapter {
  id?: number
  truyenId: number
  chapterNumber: number
  title: string
  content: string
  viewCount?: number
  createdAt?: string
}

export interface StoryStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  publishStatus: 'ONGOING' | 'COMPLETED' | 'PAUSED'
  approvedAt?: string
}

export interface StoryStats {
  views: number
  chapters: number
  comments: number
  favorites: number
  averageRating: number
}

export interface StoryDetailsPatch {
  title?: string | null
  slug?: string | null
  description?: string | null
  coverImage?: string | null
  publishStatus?: 'ONGOING' | 'COMPLETED' | 'PAUSED' | null
  genreIds?: number[] | null
}

export interface StoryDetailsPatchResponse {
  truyen: Story
  genreIds: number[]
}

const STORIES_API = '/api/truyen'
const CHAPTERS_API = '/api/chapters'
const GENRE_STORIES_API = '/api/truyen/the-loai'
const GENRE_STORIES_ALIAS_API = '/api/truyen/by-genre'

export default {
  // Stories CRUD
  async getAll(params?: any): Promise<Story[] | any> {
    return apiGet(STORIES_API, params)
  },

  async getById(id: number): Promise<Story> {
    return apiGet(`${STORIES_API}/${id}`)
  },

  async getBySlug(slug: string): Promise<Story> {
    return apiGet(`${STORIES_API}/slug/${slug}`)
  },

  async getByGenreSlug(slug: string, params: any = {}): Promise<Story[] | any> {
    try {
      return await apiGet(`${GENRE_STORIES_API}/${slug}`, params)
    } catch (e) {
      return apiGet(`${GENRE_STORIES_ALIAS_API}/${slug}`, params)
    }
  },

  async getStats(id: number): Promise<StoryStats> {
    return apiGet(`${STORIES_API}/${id}/stats`)
  },

  async create(data: Omit<Story, 'id'>): Promise<Story> {
    return apiPost(STORIES_API, data)
  },

  async update(id: number, data: Partial<Story>): Promise<Story> {
    return apiPut(`${STORIES_API}/${id}`, data)
  },

  async updateDetails(id: number, data: StoryDetailsPatch): Promise<StoryDetailsPatchResponse> {
    return apiPatch(`${STORIES_API}/${id}/details`, data)
  },

  async delete(id: number): Promise<void> {
    return apiDelete(`${STORIES_API}/${id}`)
  },

  // Story status
  async getStatus(id: number): Promise<StoryStatus> {
    return apiGet(`${STORIES_API}/${id}/status`)
  },

  // Admin actions
  async getPending(params?: any): Promise<Story[] | any> {
    return apiGet('/api/admin/truyen/pending', params)
  },

  async approve(id: number): Promise<void> {
    return apiPut(`/api/admin/truyen/${id}/approve`)
  },

  async reject(id: number): Promise<void> {
    return apiPut(`/api/admin/truyen/${id}/reject`)
  },

  // Chapters
  async getChapters(storyId: number, params: any = {}): Promise<Chapter[] | any> {
    return apiGet(CHAPTERS_API, { truyenId: storyId, ...params })
  },

  async getChaptersMeta(storyId: number, params: any = {}): Promise<Chapter[] | any> {
    return apiGet(`${STORIES_API}/${storyId}/chapters`, params)
  },

  async getChapterById(id: number): Promise<Chapter> {
    return apiGet(`${CHAPTERS_API}/${id}`)
  },

  async createChapter(data: Omit<Chapter, 'id'>): Promise<Chapter> {
    return apiPost(CHAPTERS_API, data)
  },

  async updateChapter(id: number, data: Partial<Chapter>): Promise<Chapter> {
    return apiPut(`${CHAPTERS_API}/${id}`, data)
  },

  async deleteChapter(id: number): Promise<void> {
    return apiDelete(`${CHAPTERS_API}/${id}`)
  },

  // Increment view count
  async incrementView(id: number): Promise<void> {
    return apiPost(`${STORIES_API}/${id}/increment-view`)
  }
}
