<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">Trang của bạn</h1>
      <div v-if="!auth.isAuthenticated" class="bg-white p-4 rounded shadow">
        Bạn cần đăng nhập để xem thông tin.
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Thông tin cá nhân</h2>
          <div class="text-sm text-gray-600">Username: {{ auth.user?.username }}</div>
          <div class="text-sm text-gray-600">Email: {{ auth.user?.email || 'Chưa có' }}</div>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Truyện yêu thích</h2>
          <div v-if="favorites.length === 0" class="text-sm text-gray-500">Chưa có truyện nào.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="f in favorites" :key="f.truyenId">Truyện ID: {{ f.truyenId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Đang theo dõi</h2>
          <div v-if="following.length === 0" class="text-sm text-gray-500">Chưa theo dõi ai.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="f in following" :key="f.followingId">User ID: {{ f.followingId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Lịch sử đọc</h2>
          <div v-if="history.length === 0" class="text-sm text-gray-500">Chưa có lịch sử.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="h in history" :key="h.chapterId">Chương ID: {{ h.chapterId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Thể loại yêu thích</h2>
          <div v-if="userGenres.length === 0" class="text-sm text-gray-500">Chưa chọn thể loại.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="g in userGenres" :key="g.genreId">{{ genreName(g.genreId) }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useGenreStore } from '../stores'
import favoritesService from '../services/favorites'
import followsService from '../services/follows'
import readingHistoryService from '../services/readingHistory'
import userGenresService from '../services/userGenres'

const auth = useAuthStore()
const genreStore = useGenreStore()
const router = useRouter()

const favorites = ref([])
const following = ref([])
const history = ref([])
const userGenres = ref([])

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

function genreName(id) {
  return genreStore.genres.find(g => g.id === id)?.name || `Genre ${id}`
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/me' } })
    return
  }

  await auth.fetchMe()
  await genreStore.fetchGenres()
  favorites.value = normalizePaged(await favoritesService.getMine({ page: 0, size: 50 }))
  following.value = normalizePaged(await followsService.getFollowing({ page: 0, size: 50 }))
  history.value = normalizePaged(await readingHistoryService.getMine({ page: 0, size: 50 }))
  userGenres.value = normalizePaged(await userGenresService.getMine())
})
</script>

