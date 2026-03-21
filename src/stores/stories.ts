import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import storiesService, { type Story, type Chapter, type StoryStatus } from '@/services/stories'

export interface StoriesState {
  stories: Story[]
  currentStory: Story | null
  chapters: Chapter[]
  stats: any | null
  loading: boolean
  error: string | null
  creatingStory: boolean
  addingChapter: boolean
  pagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
  chaptersPagination: {
    page: number
    size: number
    total: number
    totalPages: number
  }
}

export const useStoriesStore = defineStore('stories', () => {
  // State
  const stories = ref<Story[]>([])
  const currentStory = ref<Story | null>(null)
  const chapters = ref<Chapter[]>([])
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const creatingStory = ref(false)
  const addingChapter = ref(false)
  const pagination = ref({ page: 0, size: 12, total: 0, totalPages: 0 })
  const chaptersPagination = ref({ page: 0, size: 50, total: 0, totalPages: 0 })

  // Computed
  const hasStories = computed(() => stories.value.length > 0)
  const publishedStories = computed(() =>
    stories.value.filter(s => s.status === 'APPROVED')
  )
  const pendingStories = computed(() =>
    stories.value.filter(s => s.status === 'PENDING')
  )

  // Actions
  function normalizePaged(payload: any, fallbackSize: number) {
    if (Array.isArray(payload)) {
      return {
        items: payload,
        total: payload.length,
        totalPages: payload.length ? 1 : 0,
        size: payload.length || fallbackSize
      }
    }
    if (!payload) {
      return { items: [], total: 0, totalPages: 0, size: fallbackSize }
    }
    const items = payload.content || payload.data || payload.items || payload.results || []
    const size = payload.size ?? payload.pageSize ?? fallbackSize
    const total = payload.totalElements ?? payload.total ?? payload.totalCount ?? items.length
    const totalPages = payload.totalPages ?? payload.pages ?? (size ? Math.ceil(total / size) : 0)
    return { items, total, totalPages, size }
  }

  async function fetchStories(params: any = {}) {
    loading.value = true
    error.value = null
    try {
      const data = await storiesService.getAll(params)
      const normalized = normalizePaged(data, pagination.value.size)
      stories.value = normalized.items
      pagination.value = {
        page: params.page ?? pagination.value.page,
        size: normalized.size,
        total: normalized.total,
        totalPages: normalized.totalPages
      }
    } catch (err) {
      // Retry without sort params in case backend doesn't support the requested sort field
      if (params?.sortBy) {
        try {
          const retryParams = { ...params }
          delete retryParams.sortBy
          delete retryParams.sortDir
          const data = await storiesService.getAll(retryParams)
          const normalized = normalizePaged(data, pagination.value.size)
          stories.value = normalized.items
          pagination.value = {
            page: retryParams.page ?? pagination.value.page,
            size: normalized.size,
            total: normalized.total,
            totalPages: normalized.totalPages
          }
          return
        } catch (retryErr) {
          const message = retryErr instanceof Error ? retryErr.message : 'Lỗi khi tải danh sách truyện'
          error.value = message
          console.error(retryErr)
          return
        }
      }
      const message = err instanceof Error ? err.message : 'Lỗi khi tải danh sách truyện'
      error.value = message
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createStory(storyData: Omit<Story, 'id'>): Promise<Story> {
    creatingStory.value = true
    try {
      const newStory = await storiesService.create(storyData)
      stories.value.unshift(newStory) // Add to beginning of list
      return newStory
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo truyện'
      throw new Error(message)
    } finally {
      creatingStory.value = false
    }
  }

  async function fetchStoryById(id: number): Promise<Story> {
    loading.value = true
    try {
      const data = await storiesService.getById(id)
      currentStory.value = data
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải truyện'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function fetchStoryBySlug(slug: string): Promise<Story> {
    loading.value = true
    try {
      const data = await storiesService.getBySlug(slug)
      currentStory.value = data
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải truyện'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function fetchStoryStats(id: number): Promise<any> {
    try {
      const data = await storiesService.getStats(id)
      stats.value = data
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lấy thống kê truyện'
      throw new Error(message)
    }
  }

  async function updateStoryDetails(id: number, data: any) {
    try {
      return await storiesService.updateDetails(id, data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật chi tiết truyện'
      throw new Error(message)
    }
  }

  async function fetchPendingStories(params: any = {}) {
    loading.value = true
    try {
      const data = await storiesService.getPending(params)
      const normalized = normalizePaged(data, pagination.value.size)
      return normalized.items
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách chưa duyệt'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function updateStory(id: number, data: Partial<Story>): Promise<Story> {
    try {
      const updatedStory = await storiesService.update(id, data)
      const index = stories.value.findIndex(s => s.id === id)
      if (index !== -1) {
        stories.value[index] = updatedStory
      }
      return updatedStory
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật truyện'
      throw new Error(message)
    }
  }

  async function deleteStory(id: number): Promise<void> {
    try {
      await storiesService.delete(id)
      stories.value = stories.value.filter(s => s.id !== id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa truyện'
      throw new Error(message)
    }
  }

  async function getStoryStatus(id: number): Promise<StoryStatus> {
    try {
      return await storiesService.getStatus(id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lấy trạng thái truyện'
      throw new Error(message)
    }
  }

  async function approveStory(id: number): Promise<void> {
    try {
      await storiesService.approve(id)
      // Update local state
      const story = stories.value.find(s => s.id === id)
      if (story) {
        story.status = 'APPROVED'
        story.approvedAt = new Date().toISOString()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể duyệt truyện'
      throw new Error(message)
    }
  }

  async function rejectStory(id: number): Promise<void> {
    try {
      await storiesService.reject(id)
      // Update local state
      const story = stories.value.find(s => s.id === id)
      if (story) {
        story.status = 'REJECTED'
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể từ chối truyện'
      throw new Error(message)
    }
  }

  async function fetchChapters(storyId: number): Promise<Chapter[]> {
    loading.value = true
    try {
      const data = await storiesService.getChapters(storyId, {
        page: chaptersPagination.value.page,
        size: chaptersPagination.value.size
      })
      const normalized = normalizePaged(data, chaptersPagination.value.size)
      chapters.value = normalized.items
      chaptersPagination.value = {
        page: chaptersPagination.value.page,
        size: normalized.size,
        total: normalized.total,
        totalPages: normalized.totalPages
      }
      return chapters.value
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải danh sách chương'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function addChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
    addingChapter.value = true
    try {
      const newChapter = await storiesService.createChapter(chapterData)
      chapters.value.push(newChapter)
      return newChapter
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm chương'
      throw new Error(message)
    } finally {
      addingChapter.value = false
    }
  }

  async function updateChapter(id: number, data: Partial<Chapter>): Promise<Chapter> {
    try {
      const updatedChapter = await storiesService.updateChapter(id, data)
      const index = chapters.value.findIndex(c => c.id === id)
      if (index !== -1) {
        chapters.value[index] = updatedChapter
      }
      return updatedChapter
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật chương'
      throw new Error(message)
    }
  }

  async function deleteChapter(id: number): Promise<void> {
    try {
      await storiesService.deleteChapter(id)
      chapters.value = chapters.value.filter(c => c.id !== id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa chương'
      throw new Error(message)
    }
  }

  async function incrementView(id: number): Promise<void> {
    try {
      await storiesService.incrementView(id)
    } catch (err) {
      console.error('Error incrementing view:', err)
    }
  }

  function setCurrentStory(story: Story | null): void {
    currentStory.value = story
  }

  function setChaptersPage(page: number): void {
    chaptersPagination.value.page = page
  }

  function setStoriesPage(page: number): void {
    pagination.value.page = page
  }

  function resetError(): void {
    error.value = null
  }

  function clearChapters(): void {
    chapters.value = []
  }

  return {
    // State
    stories,
    currentStory,
    chapters,
    stats,
    loading,
    error,
    creatingStory,
    addingChapter,
    pagination,
    chaptersPagination,
    // Computed
    hasStories,
    publishedStories,
    pendingStories,
    // Actions
    fetchStories,
    createStory,
    fetchStoryById,
    fetchStoryBySlug,
    fetchStoryStats,
    updateStoryDetails,
    fetchPendingStories,
    updateStory,
    deleteStory,
    getStoryStatus,
    approveStory,
    rejectStory,
    fetchChapters,
    addChapter,
    updateChapter,
    deleteChapter,
    incrementView,
    setCurrentStory,
    setChaptersPage,
    setStoriesPage,
    resetError,
    clearChapters
  }
})



