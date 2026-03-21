<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="text-sm text-gray-500 mb-3">
        <router-link to="/" class="hover:text-blue-600">Trang chủ</router-link>
        <span class="mx-2">/</span>
        <router-link to="/categories" class="hover:text-blue-600">Thể loại</router-link>
        <span class="mx-2">/</span>
        <span>{{ genre?.name || 'Đang tải...' }}</span>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h1 class="text-2xl font-bold mb-2">TRUYỆN {{ genre?.name?.toUpperCase() || '...' }}</h1>
        <p class="text-sm text-gray-600">
          {{ genre?.description || 'Danh sách truyện theo thể loại bạn chọn.' }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main class="lg:col-span-2 space-y-4">
          <div v-if="loading" class="bg-white p-4 rounded shadow text-sm text-gray-500">Đang tải danh sách...</div>
          <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
            {{ error }}
          </div>
          <div v-else-if="stories.length === 0" class="bg-white p-4 rounded shadow text-sm text-gray-500">
            Chưa có truyện thuộc thể loại này.
          </div>
          <div v-else class="space-y-4">
            <article
              v-for="s in stories"
              :key="s.id || s.slug"
              class="bg-white rounded shadow p-4 flex gap-4"
            >
              <router-link :to="storyLink(s)" class="shrink-0">
                <img :src="storyCover(s)" class="w-28 h-36 object-cover rounded" />
              </router-link>
              <div class="flex-1">
                <router-link :to="storyLink(s)" class="text-lg font-semibold hover:text-blue-600">
                  {{ s.title }}
                </router-link>
                <div class="text-sm text-gray-500 mt-1">
                  Tác giả: {{ s.author || s.authorName || 'Ẩn danh' }}
                </div>
                <div class="text-sm text-gray-500">
                  Trạng thái: {{ publishLabel(s.publishStatus) }}
                </div>
                <p class="text-sm text-gray-700 mt-2 line-clamp-3">
                  {{ s.description || 'Chưa có mô tả.' }}
                </p>
              </div>
            </article>
          </div>

          <div v-if="totalPages > 1" class="flex items-center justify-between text-sm text-gray-600">
            <div>Trang {{ displayPage }} / {{ totalPages }}</div>
            <div class="space-x-2">
              <button @click="prevPage" :disabled="page <= 0" class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
              <button @click="nextPage" :disabled="page + 1 >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
            </div>
          </div>
        </main>

        <aside class="space-y-6">
          <div class="bg-white rounded shadow p-4">
            <h4 class="font-semibold mb-3">Top truyện đề cử</h4>
            <ol class="space-y-3">
              <li v-for="(s, idx) in topStories" :key="s.id || s.slug" class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center">{{ idx + 1 }}</div>
                <div class="flex-1">
                  <router-link :to="storyLink(s)" class="text-sm font-medium hover:text-blue-600">
                    {{ s.title }}
                  </router-link>
                  <div class="text-xs text-gray-500">{{ s.author || s.authorName || 'Ẩn danh' }}</div>
                </div>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useGenreStore } from '../stores'
import genresService from '../services/genres'
import storiesService from '../services/stories'

const route = useRoute()
const genreStore = useGenreStore()

const loading = ref(false)
const error = ref('')
const genre = ref(null)
const stories = ref([])

const page = ref(0)
const size = ref(12)
const totalPages = ref(0)
const totalElements = ref(0)

const displayPage = computed(() => page.value + 1)
const topStories = computed(() => stories.value.slice(0, 9))

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function normalizePaged(payload, fallbackSize) {
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

function publishLabel(status) {
  switch (status) {
    case 'ONGOING': return 'Đang tiến hành'
    case 'COMPLETED': return 'Hoàn thành'
    case 'PAUSED': return 'Tạm dừng'
    default: return 'Không rõ'
  }
}

function storyLink(story) {
  const slugOrId = story.slug || story.id
  return { name: 'StoryDetail', params: { id: slugOrId } }
}

function storyCover(story) {
  return story.coverImage || 'https://picsum.photos/seed/genre/300/400'
}

function nextPage() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  loadStories()
}

function prevPage() {
  if (page.value <= 0) return
  page.value -= 1
  loadStories()
}

async function resolveGenre() {
  const slug = String(route.params.slug || '').toLowerCase()
  try {
    const data = await genresService.getBySlug(slug)
    genre.value = data
    return
  } catch {
    // fallback to local list
  }

  if (!genreStore.genres.length) {
    await genreStore.fetchGenres()
  }

  const bySlug = genreStore.genres.find(g => String(g.slug || '').toLowerCase() === slug)
  if (bySlug) {
    genre.value = bySlug
    return
  }

  const byId = genreStore.genres.find(g => String(g.id) === slug)
  if (byId) {
    genre.value = byId
    return
  }

  const byName = genreStore.genres.find(g => slugify(g.name) === slug)
  genre.value = byName || null
}

async function loadStories() {
  loading.value = true
  error.value = ''
  const genreSlug = String(route.params.slug || '')
  try {
    const data = await storiesService.getByGenreSlug(genreSlug, {
      page: page.value,
      size: size.value,
      sortBy: 'createdAt',
      sortDir: 'desc'
    })
    const normalized = normalizePaged(data, size.value)
    stories.value = normalized.items
    totalPages.value = normalized.totalPages
    totalElements.value = normalized.total
  } catch (err) {
    if (genre.value?.id) {
      try {
        const data = await storiesService.getAll({
          genreId: genre.value.id,
          page: page.value,
          size: size.value,
          sortBy: 'createdAt',
          sortDir: 'desc'
        })
        const normalized = normalizePaged(data, size.value)
        stories.value = normalized.items
        totalPages.value = normalized.totalPages
        totalElements.value = normalized.total
        loading.value = false
        return
      } catch (innerErr) {
        error.value = innerErr instanceof Error ? innerErr.message : 'Không thể tải danh sách truyện'
      }
    } else {
      error.value = err instanceof Error ? err.message : 'Không thể tải danh sách truyện'
    }
  } finally {
    loading.value = false
  }
}

async function loadPage() {
  page.value = 0
  await resolveGenre()
  await loadStories()
}

watch(
  () => route.params.slug,
  () => {
    loadPage()
  }
)

onMounted(loadPage)
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
