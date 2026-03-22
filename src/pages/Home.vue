<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <main class="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section class="lg:col-span-2 space-y-6">
        <div v-if="error" class="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
          {{ error }}
        </div>

        <!-- Hero -->
        <div v-if="heroStory" class="relative rounded-lg overflow-hidden shadow bg-white">
          <img :src="storyCover(heroStory)" alt="hero" class="w-full h-56 object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div class="p-6 text-white">
              <h2 class="text-2xl font-bold">{{ heroStory.title }}</h2>
              <p class="text-sm mt-1">
                Tác giả: {{ storyAuthor(heroStory) }}
              </p>
              <div class="mt-3">
                <router-link :to="storyLink(heroStory)" class="px-4 py-2 bg-blue-500 rounded mr-2 inline-block">Đọc ngay</router-link>
                <router-link :to="storyLink(heroStory)" class="px-4 py-2 bg-white text-gray-800 rounded inline-block">Chi tiết</router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Hot stories -->
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">Truyện Hot</h3>
          </div>
          <div v-if="loading" class="text-sm text-gray-500">Đang tải...</div>
          <div v-else class="flex gap-4 overflow-x-auto pb-2">
            <div v-for="s in hotStories" :key="s.id || s.slug" class="w-32 flex-shrink-0">
              <router-link :to="storyLink(s)">
                <img :src="storyCover(s)" class="w-32 h-44 object-cover rounded" />
              </router-link>
              <div class="mt-2 text-sm font-medium">{{ s.title }}</div>
              <div class="text-xs text-gray-500">{{ storyAuthor(s) }}</div>
            </div>
          </div>
        </div>

        <!-- Story list -->
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Danh Sách Truyện</h3>
            <div class="text-sm text-gray-500">Sắp xếp: {{ sortLabel }}</div>
          </div>

          <div v-if="loading" class="text-sm text-gray-500">Đang tải danh sách...</div>
          <div v-else-if="stories.length === 0" class="text-sm text-gray-500">Chưa có truyện nào.</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article v-for="story in stories" :key="story.id || story.slug" class="flex gap-3 p-3 border rounded">
              <router-link :to="storyLink(story)">
                <img :src="storyCover(story)" class="w-24 h-32 object-cover rounded" />
              </router-link>
              <div class="flex-1">
                <router-link :to="storyLink(story)" class="font-semibold hover:text-blue-600">
                  {{ story.title }}
                </router-link>
                <div class="text-xs text-gray-500">{{ storyAuthor(story) }}</div>
                <p class="text-sm mt-2 text-gray-700 line-clamp-3">{{ storySummary(story) }}</p>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Trang {{ displayPage }} / {{ totalPages || 1 }}
            </div>
            <div class="space-x-2">
              <button @click="prevPage" :disabled="page <= 0" class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
              <button @click="nextPage" :disabled="page + 1 >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
            </div>
          </div>
        </div>
      </section>

      <aside class="space-y-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h4 class="font-semibold mb-3">Thể loại</h4>
          <ul class="space-y-2 text-sm text-gray-600">
            <li v-for="cat in genres" :key="cat.id">
              <router-link :to="genreLink(cat)" class="inline-flex items-center gap-2 hover:text-blue-600">
                <span class="text-gray-400">·</span>
                <span>{{ cat.name }}</span>
              </router-link>
            </li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <h4 class="font-semibold mb-3">Mới cập nhật</h4>
          <ul class="space-y-3">
            <li v-for="n in latestStories" :key="n.id || n.slug" class="flex items-center gap-3">
              <img :src="storyCover(n)" class="w-12 h-14 object-cover rounded" />
              <div class="text-sm">
                <div class="font-medium">{{ n.title }}</div>
                <div class="text-xs text-gray-500">{{ storyAuthor(n) }}</div>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoriesStore, useGenreStore } from '../stores'

const route = useRoute()
const router = useRouter()
const storiesStore = useStoriesStore()
const genresStore = useGenreStore()

const loading = computed(() => storiesStore.loading)
const error = computed(() => storiesStore.error)
const stories = computed(() => storiesStore.stories)
const genres = computed(() => genresStore.genres)

const page = ref(Number(route.query.page || 0))
const size = ref(Number(route.query.size || 12))

const sortBy = computed(() => route.query.sortBy || 'createdAt')
const sortDir = computed(() => route.query.sortDir || 'desc')
const sortLabel = computed(() => `${sortBy.value} (${sortDir.value})`)

const totalPages = computed(() => storiesStore.pagination.totalPages || 0)
const displayPage = computed(() => page.value + 1)

const heroStory = computed(() => stories.value[0] || null)
const hotStories = computed(() => stories.value.slice(0, 6))
const latestStories = computed(() => stories.value.slice(0, 5))

function storyLink(story) {
  const slugOrId = story.slug || story.id
  return { name: 'StoryDetail', params: { id: slugOrId } }
}

function storyCover(story) {
  return story.coverImage || 'https://picsum.photos/seed/story/300/400'
}

function storyAuthor(story) {
  return story.author || story.authorName || 'Ẩn danh'
}

function storySummary(story) {
  return story.description || 'Chưa có mô tả.'
}

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

function genreLink(genre) {
  const slug = genre.slug || slugify(genre.name) || String(genre.id)
  return { name: 'GenreDetail', params: { slug } }
}

async function loadStories() {
  await storiesStore.fetchStories({
    page: page.value,
    size: size.value,
    sortBy: sortBy.value,
    sortDir: sortDir.value,
    status: route.query.status || undefined,
    publishStatus: route.query.publishStatus || undefined,
    authorId: route.query.authorId || undefined,
    keyword: route.query.keyword || undefined
  })
}

async function loadGenres() {
  if (!genresStore.genres.length) {
    await genresStore.fetchGenres()
  }
}

function updateRoute(newPage) {
  router.push({
    name: 'Home',
    query: {
      ...route.query,
      page: newPage,
      size: size.value,
      sortBy: sortBy.value,
      sortDir: sortDir.value
    }
  })
}

function nextPage() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
  updateRoute(page.value)
}

function prevPage() {
  if (page.value <= 0) return
  page.value -= 1
  updateRoute(page.value)
}

watch(
  () => route.query,
  () => {
    page.value = Number(route.query.page || 0)
    size.value = Number(route.query.size || 12)
    loadStories()
  },
  { immediate: true, deep: true }
)

onMounted(() => {
  loadGenres()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

