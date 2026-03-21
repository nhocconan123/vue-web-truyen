import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import genresService from '@/services/genres'

export interface Genre {
  id?: number
  name: string
  slug: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface GenreState {
  genres: Genre[]
  loading: boolean
  error: string | null
  deletingId: number | null
}

export const useGenreStore = defineStore('genres', () => {
  // State
  const genres = ref<Genre[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const deletingId = ref<number | null>(null)

  // Computed
  const hasGenres = computed(() => genres.value.length > 0)
  const activeGenres = computed(() => genres.value.filter(g => g.status === 'ACTIVE'))

  // Actions
  async function fetchGenres() {
    loading.value = true
    error.value = null
    try {
      const data = await genresService.getAll()
      genres.value = Array.isArray(data) ? data : data.data || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải danh sách thể loại'
      error.value = message
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function saveGenre(genreData: Genre) {
    try {
      if (genreData.id) {
        await genresService.update(genreData.id, genreData)
      } else {
        await genresService.create(genreData)
      }
      await fetchGenres()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu thể loại'
      throw new Error(message)
    }
  }

  async function deleteGenre(id: number) {
    deletingId.value = id
    try {
      await genresService.delete(id)
      await fetchGenres()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xóa thể loại'
      throw new Error(message)
    } finally {
      deletingId.value = null
    }
  }

  function resetError() {
    error.value = null
  }

  return {
    // State
    genres,
    loading,
    error,
    deletingId,
    // Computed
    hasGenres,
    activeGenres,
    // Actions
    fetchGenres,
    saveGenre,
    deleteGenre,
    resetError
  }
})
