<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">Top truyện</h1>
      <div v-if="loading" class="text-sm text-gray-500">Đang tải...</div>
      <div v-else class="space-y-3">
        <div v-for="(s, idx) in stories" :key="s.id || s.slug" class="bg-white p-4 rounded shadow flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">#{{ idx + 1 }}</div>
            <router-link :to="storyLink(s)" class="font-semibold hover:text-blue-600">{{ s.title }}</router-link>
            <div class="text-xs text-gray-500">{{ s.author || 'Ẩn danh' }}</div>
          </div>
          <router-link :to="storyLink(s)" class="text-sm text-blue-600">Chi tiết</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useStoriesStore } from '../stores'

const storiesStore = useStoriesStore()
const stories = computed(() => storiesStore.stories)
const loading = computed(() => storiesStore.loading)

function storyLink(story) {
  const slugOrId = story.slug || story.id
  return { name: 'StoryDetail', params: { id: slugOrId } }
}

onMounted(() => {
  storiesStore.fetchStories({ page: 0, size: 20, sortBy: 'views', sortDir: 'desc' })
})
</script>

