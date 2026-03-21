<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Quản lý người dùng</h1>
        <p class="text-sm text-gray-600">Danh sách người dùng và thiết lập vai trò / trạng thái</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="refreshData" class="px-3 py-1 border rounded text-sm">Làm mới</button>
      </div>
    </div>

    <div class="bg-white p-4 rounded shadow mb-6">
      <div class="flex flex-col sm:flex-row gap-2">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm theo username hoặc email"
          class="flex-1 px-3 py-2 border rounded"
        />
        <select v-model="filters.role" class="px-3 py-2 border rounded">
          <option value="">Tất cả vai trò</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select v-model="filters.status" class="px-3 py-2 border rounded">
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đã kích hoạt</option>
          <option value="inactive">Chưa kích hoạt</option>
        </select>
        <button @click="resetFilters" class="px-3 py-2 border rounded">Reset</button>
      </div>
    </div>

    <div class="bg-white rounded shadow">
      <table class="w-full text-sm">
        <thead class="text-left text-gray-600">
          <tr>
            <th class="p-2">#</th>
            <th class="p-2">Username</th>
            <th class="p-2">Email</th>
            <th class="p-2">Vai trò</th>
            <th class="p-2">Trạng thái</th>
            <th class="p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(u, idx) in filteredUsers" :key="u.id" class="border-t">
            <td class="p-2 align-top">{{ idx + 1 }}</td>
            <td class="p-2 align-top">{{ u.username }}</td>
            <td class="p-2 align-top">{{ u.email }}</td>
            <td class="p-2 align-top capitalize">{{ u.role }}</td>
            <td class="p-2 align-top">
              <span
                :class="{
                  'text-green-600': u.status === 'active',
                  'text-red-600': u.status === 'inactive'
                }"
              >
                {{ u.status === 'active' ? 'Đã kích hoạt' : 'Chưa kích hoạt' }}
              </span>
            </td>
            <td class="p-2 align-top">
              <button @click="editUser(u.id)" class="px-2 py-1 text-sm border rounded mr-2">Sửa</button>
              <button
                @click="deleteUser(u.id)"
                class="px-2 py-1 text-sm bg-red-500 text-white rounded"
              >
                Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-4 text-gray-500 text-sm">
      Hiển thị {{ filteredUsers.length }} trên tổng số {{ users.length }} người dùng.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const users = ref([
  { id: 1, username: 'john', email: 'john@example.com', role: 'user', status: 'active' },
  { id: 2, username: 'jane', email: 'jane@example.com', role: 'admin', status: 'active' },
  { id: 3, username: 'mike', email: 'mike@example.com', role: 'user', status: 'inactive' }
])

const filters = ref({ search: '', role: '', status: '' })

const filteredUsers = computed(() => {
  return users.value.filter(u => {
    const matchesSearch =
      !filters.value.search ||
      u.username.includes(filters.value.search) ||
      u.email.includes(filters.value.search)
    const matchesRole = !filters.value.role || u.role === filters.value.role
    const matchesStatus = !filters.value.status || u.status === filters.value.status
    return matchesSearch && matchesRole && matchesStatus
  })
})

function editUser(id) {
  // navigate to edit page if implemented
  console.log('edit', id)
}

function deleteUser(id) {
  if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
    users.value = users.value.filter(u => u.id !== id)
  }
}

function refreshData() {
  // placeholder for API call
  console.log('refresh users')
}

function resetFilters() {
  filters.value = { search: '', role: '', status: '' }
}
</script>
