<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Danh Sách Chương</h3>
      <div class="text-sm text-gray-500">Tổng: {{ chapters.length }}</div>
    </div>
    <ul class="space-y-2">
      <li v-for="c in chapters" :key="c.id" class="flex items-center justify-between p-2 border rounded">
        <div class="text-sm">{{ c.title }}</div>
        <div class="text-xs text-gray-500">{{ c.time }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({ chapters: { type: Array, default: () => [] } })
</script>

<style scoped></style>
