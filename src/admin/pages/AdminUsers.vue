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

    <div v-if="!isAdmin" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
      Bạn không có quyền truy cập trang quản lý người dùng.
    </div>

    <template v-else>
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
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select v-model="filters.status" class="px-3 py-2 border rounded">
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đã kích hoạt</option>
            <option value="INACTIVE">Chưa kích hoạt</option>
          </select>
          <button @click="resetFilters" class="px-3 py-2 border rounded">Reset</button>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
        {{ error }}
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
            <tr v-if="loading" class="border-t">
              <td colspan="6" class="p-4 text-center text-gray-500">Đang tải...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0" class="border-t">
              <td colspan="6" class="p-4 text-center text-gray-500">Không có người dùng phù hợp</td>
            </tr>
            <tr v-for="(u, idx) in filteredUsers" :key="u.id || idx" class="border-t">
              <td class="p-2 align-top">{{ idx + 1 + page * size }}</td>
              <td class="p-2 align-top">{{ u.username }}</td>
              <td class="p-2 align-top">{{ u.email || '-' }}</td>
              <td class="p-2 align-top capitalize">{{ roleText(u) }}</td>
              <td class="p-2 align-top">
                <span :class="statusClass(u)">
                  {{ statusText(u) }}
                </span>
              </td>
              <td class="p-2 align-top">
                <button
                  @click="editUser(u)"
                  :disabled="!canEditRole(u)"
                  :title="canEditRole(u) ? '' : 'Chỉ admin mới được sửa quyền người dùng khác.'"
                  class="px-2 py-1 text-sm border rounded mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sửa
                </button>
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
        Hiển thị {{ filteredUsers.length }} trên tổng số {{ totalUsers }} người dùng.
      </p>

      <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
        <div>Trang {{ displayPage }} / {{ totalPages || 1 }}</div>
        <div class="space-x-2">
          <button @click="prevPage" :disabled="page <= 0" class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
          <button @click="nextPage" :disabled="page + 1 >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
        </div>
      </div>

      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-md rounded-lg bg-white shadow-lg">
          <div class="flex items-center justify-between border-b px-4 py-3">
            <h3 class="text-lg font-semibold">Sửa quyền người dùng</h3>
            <button class="text-gray-500 hover:text-gray-700" @click="closeEditModal">✕</button>
          </div>
          <div class="space-y-4 px-4 py-4">
            <div>
              <label class="text-sm text-gray-600">Username</label>
              <input
                v-model="editForm.username"
                type="text"
                class="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="text-sm text-gray-600">Vai trò</label>
              <select v-model="editForm.role" class="mt-1 w-full rounded border px-3 py-2 text-sm">
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <p v-if="editError" class="text-xs text-red-600">{{ editError }}</p>
          </div>
          <div class="flex items-center justify-end gap-2 border-t px-4 py-3">
            <button class="px-3 py-1.5 border rounded text-sm" @click="closeEditModal">Hủy</button>
            <button
              class="px-3 py-1.5 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
              :disabled="savingEdit"
              @click="submitEdit"
            >
              {{ savingEdit ? 'Đang lưu...' : 'Lưu' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import usersService from '../../services/users'
import { useAuthStore } from '../../stores'

const router = useRouter()
const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(0)
const size = ref(10)
const pagination = ref({ page: 0, size: 10, total: 0, totalPages: 0 })

const filters = ref({ search: '', role: '', status: '' })
const isAdmin = computed(() => authStore.isAdmin)
const currentUserId = computed(() => authStore.user?.id)
const showEditModal = ref(false)
const editTarget = ref(null)
const editForm = ref({ username: '', role: 'USER' })
const savingEdit = ref(false)
const editError = ref('')

const filteredUsers = computed(() => {
  const search = String(filters.value.search || '').toLowerCase()
  const roleFilter = String(filters.value.role || '').toLowerCase()
  const statusFilter = String(filters.value.status || '').toLowerCase()
  return users.value.filter(u => {
    const username = String(u.username || '').toLowerCase()
    const email = String(u.email || '').toLowerCase()
    const role = String(u.role || '').toLowerCase()
    const status = statusValue(u)
    const matchesSearch = !search || username.includes(search) || email.includes(search)
    const matchesRole = !roleFilter || role === roleFilter
    const matchesStatus = !statusFilter || status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })
})

const totalPages = computed(() => pagination.value.totalPages || 0)
const displayPage = computed(() => page.value + 1)
const totalUsers = computed(() => pagination.value.total || users.value.length)

function canEditRole(user) {
  if (!isAdmin.value) return false
  if (!user?.id || !currentUserId.value) return true
  return String(user.id) !== String(currentUserId.value)
}

function editUser(user) {
  if (!canEditRole(user)) {
    return
  }
  editTarget.value = user
  editForm.value = {
    username: user?.username || '',
    role: String(user?.role || 'USER').toUpperCase()
  }
  editError.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  editTarget.value = null
  editError.value = ''
}

async function submitEdit() {
  if (!editTarget.value?.id) return
  if (!canEditRole(editTarget.value)) return
  const role = String(editForm.value.role || 'USER').toUpperCase()
  const username = String(editForm.value.username || '').trim()
  const usernameChanged = username && username !== editTarget.value.username

  savingEdit.value = true
  editError.value = ''
  try {
    let updated
    if (usernameChanged) {
      updated = await usersService.adminUpdate(editTarget.value.id, { username, role })
    } else {
      updated = await usersService.adminUpdateRole(editTarget.value.id, role)
    }
    const index = users.value.findIndex(u => String(u.id) === String(editTarget.value.id))
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...(updated || {}), role }
      if (usernameChanged) {
        users.value[index].username = username
      }
    }
    closeEditModal()
  } catch (err) {
    editError.value = err instanceof Error ? err.message : 'Không thể cập nhật quyền'
  } finally {
    savingEdit.value = false
  }
}

async function deleteUser(id) {
  if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
    try {
      await usersService.delete(id)
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      console.error(err)
    }
  }
}

async function refreshData() {
  await loadUsers()
}

function resetFilters() {
  filters.value = { search: '', role: '', status: '' }
}

function statusValue(user) {
  if (user?.status != null) return String(user.status).toLowerCase()
  if (user?.active === true) return 'active'
  if (user?.active === false) return 'inactive'
  return ''
}

function statusText(user) {
  const value = statusValue(user)
  if (value === 'active') return 'Đã kích hoạt'
  if (value === 'inactive') return 'Chưa kích hoạt'
  return '-'
}

function statusClass(user) {
  const value = statusValue(user)
  if (value === 'active') return 'text-green-600'
  if (value === 'inactive') return 'text-red-600'
  return 'text-gray-500'
}

function roleText(user) {
  const role = String(user?.role || '').toLowerCase()
  if (role === 'admin') return 'Admin'
  if (role === 'user') return 'User'
  return user?.role || '-'
}

function normalizePaged(payload, fallbackSize) {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      totalPages: payload.length ? 1 : 0,
      size: payload.length || fallbackSize
    }
  }
  if (!payload) {
    return { items: [], total: 0, totalPages: 0, size: fallbackSize }
  }
  const items = payload.content || payload.data || payload.items || payload.results || []
  const size = payload.size ?? payload.pageSize ?? fallbackSize
  const total = payload.totalElements ?? payload.total ?? payload.totalCount ?? items.length
  const totalPages = payload.totalPages ?? payload.pages ?? (size ? Math.ceil(total / size) : 0)
  return { items, total, totalPages, size }
}

async function loadUsers() {
  if (!isAdmin.value) {
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await usersService.getAll({ page: page.value, size: size.value })
    const normalized = normalizePaged(data, size.value)
    users.value = normalized.items
    pagination.value = {
      page: page.value,
      size: normalized.size,
      total: normalized.total,
      totalPages: normalized.totalPages
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng'
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (page.value + 1 >= totalPages.value) return
  page.value += 1
}

function prevPage() {
  if (page.value <= 0) return
  page.value -= 1
}

watch([page, size], () => {
  loadUsers()
}, { immediate: true })
</script>
