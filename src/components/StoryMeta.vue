<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <div class="flex items-start gap-4">
      <img :src="cover" class="w-28 h-36 object-cover rounded" />
      <div class="flex-1">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <div class="text-sm text-gray-500">{{ author }} · {{ genre }}</div>
        <div class="mt-3 text-sm text-gray-700">{{ description }}</div>
        <div class="mt-4 text-sm text-gray-600 grid grid-cols-2 gap-2">
          <div>Chương: <strong>{{ chapters }}</strong></div>
          <div>Lượt xem: <strong>{{ views }}</strong></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  author: String,
  genre: String,
  cover: String,
  description: String,
  chapters: [Number, String],
  views: [Number, String]
})
</script>

<style scoped></style>
