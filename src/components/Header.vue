<template>
  <header class="bg-white shadow-sm border-b w-full">
    <div class="w-full mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-4">
        <router-link to="/" class="flex items-center">
          <div class="m-2px p-2px">
            <img src="/logo.svg" alt="logo" class="w-8 h-8" />
          </div>
          <span class="mx-5px p-2px border border-red-600 text-red-600">Web truyện</span>
        </router-link>
        <nav class="hidden md:flex gap-4 text-sm text-green-600">
          <!-- <router-link to="/" class="px-2 py-1 hover:text-green-800">Trang Chủ</router-link> -->
          <div class="relative">
            <button
              type="button"
              class="px-2 py-1 hover:text-green-800 inline-flex items-center gap-1"
              @click="toggleGenres"
            >
              Thể Loại
              <span class="text-xs">▾</span>
            </button>
            <div
              v-if="showGenres"
              class="absolute left-0 mt-2 w-56 bg-white border rounded shadow-lg z-50"
              @mouseleave="closeGenres"
            >
              <router-link
                to="/categories"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                @click="closeGenres"
              >
                Tất cả thể loại
              </router-link>
              <router-link
                v-for="g in genres"
                :key="g.id"
                :to="genreLink(g)"
                class="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                @click="closeGenres"
              >
                {{ g.name }}
              </router-link>
            </div>
          </div>
          <router-link to="/top" class="px-2 py-1 hover:text-green-800">Danh Sách</router-link>
        </nav>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <form class="flex-1 md:flex-none" @submit.prevent="submitSearch">
          <input
            v-model="keyword"
            placeholder="Tìm truyện..."
            class="w-full md:w-64 border rounded px-3 py-1 text-sm"
          />
        </form>
        <div v-if="!auth.isAuthenticated" class="flex items-center gap-2">
          <router-link to="/login" class="px-3 py-1 bg-blue-600 text-white rounded text-sm">Đăng nhập</router-link>
          <router-link to="/register" class="px-3 py-1 border rounded text-sm">Đăng ký</router-link>
        </div>
        <div v-else class="flex items-center gap-2">
          <router-link to="/me" class="text-sm text-gray-700 hover:text-blue-600">
            Xin chào, {{ auth.user?.username || 'Bạn' }}
          </router-link>
          <button @click="logout" class="px-3 py-1 border rounded text-sm">Đăng xuất</button>
        </div>
      </div>

      <nav class="md:hidden w-full text-sm flex gap-4 justify-center">
        <router-link to="/" class="text-gray-700 hover:text-blue-600">Trang Chủ</router-link>
        <router-link to="/categories" class="text-gray-700 hover:text-blue-600">Thể Loại</router-link>
        <router-link to="/top" class="text-gray-700 hover:text-blue-600">Top</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useGenreStore } from '../stores'

const auth = useAuthStore()
const genreStore = useGenreStore()
const router = useRouter()
const route = useRoute()
const keyword = ref(route.query.keyword || '')
const showGenres = ref(false)
const genres = computed(() => genreStore.genres)

watch(
  () => route.query.keyword,
  (val) => {
    keyword.value = val || ''
  }
)

async function submitSearch() {
  const query = { ...route.query, keyword: keyword.value || undefined }
  if (!query.keyword) delete query.keyword
  await router.push({ name: 'Home', query })
}

function toggleGenres() {
  showGenres.value = !showGenres.value
}

function closeGenres() {
  showGenres.value = false
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

function logout() {
  auth.logout()
}

onMounted(() => {
  if (auth.isAuthenticated && !auth.user) {
    auth.fetchMe()
  }
  if (!genreStore.genres.length) {
    genreStore.fetchGenres()
  }
})

watch(
  () => route.fullPath,
  () => {
    closeGenres()
  }
)
</script>

