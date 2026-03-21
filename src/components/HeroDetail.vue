<template>
  <div class="relative rounded-lg overflow-hidden bg-white shadow">
    <img :src="cover" alt="cover" class="w-full h-56 object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
      <div class="p-6 text-white">
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p class="text-sm mt-1">Tác giả: {{ author }} · {{ genre }}</p>
        <div class="mt-3 flex gap-2">
          <button class="px-4 py-2 bg-blue-500 rounded">Đọc từ đầu</button>
          <button class="px-4 py-2 bg-white text-gray-800 rounded">Theo dõi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  author: { type: String, default: '' },
  genre: { type: String, default: '' },
  cover: { type: String, default: '' }
})
</script>

<style scoped></style>
