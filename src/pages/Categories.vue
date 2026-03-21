<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">Thể loại</h1>
      <div v-if="loading" class="text-sm text-gray-500">Đang tải...</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="g in genres"
          :key="g.id"
          :to="genreLink(g)"
          class="bg-white p-4 rounded shadow hover:shadow-md transition"
        >
          <div class="font-semibold">{{ g.name }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ g.description || 'Chưa có mô tả.' }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGenreStore } from '../stores'

const genreStore = useGenreStore()
const genres = computed(() => genreStore.genres)
const loading = computed(() => genreStore.loading)

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

onMounted(() => {
  genreStore.fetchGenres()
})
</script>

