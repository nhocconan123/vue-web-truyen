<template>
  <div class="min-h-screen flex">
    <!-- sidebar placeholder -->
    <aside class="w-64 bg-gray-800 text-white p-4">
      <h2 class="text-xl font-bold mb-4">ADMIN</h2>
      <nav class="space-y-2">
        <router-link to="/admin" class="block px-2 py-1 hover:bg-gray-700 rounded">Dashboard</router-link>
        <router-link to="/admin/stories/new" class="block px-2 py-1 hover:bg-gray-700 rounded">Thêm truyện</router-link>
        <router-link to="/admin/users" class="block px-2 py-1 hover:bg-gray-700 rounded">Người dùng</router-link>
        <router-link to="/admin/categories" class="block px-2 py-1 hover:bg-gray-700 rounded">Thể loại</router-link>
        <!-- add more admin links here -->
      </nav>
    </aside>
    <div class="flex-1 bg-gray-100">
      <header class="bg-white p-4 shadow">
        <slot name="header" />
      </header>
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout'
}
</script>
