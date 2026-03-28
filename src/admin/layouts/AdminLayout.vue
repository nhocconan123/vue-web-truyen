<template>
  <div class="min-h-screen flex flex-col lg:flex-row">
    <!-- sidebar placeholder -->
    <aside class="w-full shrink-0 bg-gray-800 p-4 text-white lg:w-64">
      <h2 class="text-xl font-bold mb-4">ADMIN</h2>
      <nav class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <router-link to="/admin" class="block px-2 py-1 hover:bg-gray-700 rounded">Dashboard</router-link>
        <router-link to="/admin/stories/new" class="block px-2 py-1 hover:bg-gray-700 rounded">Thêm truyện</router-link>
        <router-link v-if="isAdmin" to="/admin/users" class="block px-2 py-1 hover:bg-gray-700 rounded">Người dùng</router-link>
        <router-link to="/admin/categories" class="block px-2 py-1 hover:bg-gray-700 rounded">Thể loại</router-link>
        <!-- add more admin links here -->
      </nav>
    </aside>
    <div class="min-w-0 flex-1 bg-gray-100">
      <header class="bg-white p-4 shadow sm:p-5">
        <slot name="header" />
      </header>
      <main class="p-4 sm:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>
