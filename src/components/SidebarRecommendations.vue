<template>
  <div class="bg-white p-4 rounded-lg shadow">
    <h4 class="font-semibold mb-3">Đề Xuất Cho Bạn</h4>
    <ul class="space-y-3">
      <li v-for="r in recs" :key="r.id" class="flex items-center gap-3">
        <img :src="r.img" class="w-12 h-14 object-cover rounded" />
        <div class="text-sm">
          <div class="font-medium">{{ r.title }}</div>
          <div class="text-xs text-gray-500">{{ r.author }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({ recs: { type: Array, default: () => [] } })
</script>

<style scoped></style>
