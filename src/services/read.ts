import { apiGet, apiPost } from './axios'

export interface ReadStoryInfo {
  id: number
  slug: string
  title: string
}

export interface ReadChapterInfo {
  id: number
  chapterNumber: number
  title: string
  content: string
  createdAt?: string
}

export interface ReadNavInfo {
  prev?: { chapterNumber?: number | null; url?: string | null } | null
  next?: { chapterNumber?: number | null; url?: string | null } | null
}

export interface ReadStatsInfo {
  chapterViews?: number
  storyViews?: number
}

export interface ReadMeInfo {
  isLoggedIn?: boolean
  lastReadAt?: string | null
}

export interface ReadResponse {
  story: ReadStoryInfo
  chapter: ReadChapterInfo
  nav?: ReadNavInfo
  stats?: ReadStatsInfo
  me?: ReadMeInfo
}

const READ_API = '/api/read'

export default {
  async getChapter(storySlug: string, chapterNumber: number): Promise<ReadResponse> {
    return apiGet(`${READ_API}/${storySlug}/chuong/${chapterNumber}`)
  },

  async markRead(storySlug: string, chapterNumber: number): Promise<{ ok: boolean; lastReadAt?: string }> {
    return apiPost(`${READ_API}/${storySlug}/chuong/${chapterNumber}/mark-read`)
  }
}
