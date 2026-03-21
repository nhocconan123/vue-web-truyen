<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Quản lý thể loại</h1>
        <p class="text-sm text-gray-600">Danh sách thể loại truyện và các thao tác chỉnh sửa</p>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openNew" class="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
          + Thêm Thể Loại
        </button>
      </div>
    </div>

    <div
      v-if="noticeMessage"
      :class="[
        'fixed top-4 right-4 z-[60] max-w-sm border rounded p-3 text-sm shadow',
        noticeType === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
      ]"
    >
      {{ noticeMessage }}
    </div>

    <!-- Loading state -->
    <div v-if="genreStore.loading" class="bg-white rounded shadow p-6 text-center">
      <p class="text-gray-600">Đang tải...</p>
    </div>

    <!-- Error message -->
    <div v-else-if="genreStore.error" class="bg-red-50 border border-red-200 rounded p-4 mb-4">
      <p class="text-red-700">{{ genreStore.error }}</p>
      <button @click="genreStore.fetchGenres" class="mt-2 text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
        Thử lại
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-700">
          <tr>
            <th class="p-4">#</th>
            <th class="p-4">Tên</th>
            <th class="p-4">Slug</th>
            <th class="p-4">Mô tả</th>
            <th class="p-4">Trạng thái</th>
            <th class="p-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="genreStore.genres.length === 0" class="border-t">
            <td colspan="6" class="p-4 text-center text-gray-500">Chưa có thể loại nào</td>
          </tr>
          <tr v-for="(g, idx) in genreStore.genres" :key="g.id" class="border-t hover:bg-gray-50">
            <td class="p-4">{{ idx + 1 }}</td>
            <td class="p-4 font-medium">{{ g.name }}</td>
            <td class="p-4 text-gray-600">{{ g.slug }}</td>
            <td class="p-4 text-gray-600">{{ g.description || '-' }}</td>
            <td class="p-4">
              <span
                :class="{
                  'px-2 py-1 rounded text-xs font-medium': true,
                  'bg-green-100 text-green-800': g.status === 'ACTIVE',
                  'bg-gray-100 text-gray-800': g.status !== 'ACTIVE'
                }"
              >
                {{ g.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động' }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button
                @click="editGenre(g)"
                class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sửa
              </button>
              <button
                @click="deleteGenre(g.id!)"
                :disabled="genreStore.deletingId === g.id"
                class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {{ genreStore.deletingId === g.id ? 'Đang xóa...' : 'Xóa' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <genre-modal
      v-if="showModal"
      :genre="currentGenre"
      @save="saveGenre"
      @cancel="handleModalCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGenreStore, type Genre } from '@/stores'
import GenreModal from '../components/GenreModal.vue'

const genreStore = useGenreStore()

const showModal = ref(false)
const currentGenre = ref<Genre | null>(null)
const noticeMessage = ref('')
const noticeType = ref<'success' | 'error'>('success')
let noticeTimer: number | undefined

onMounted(() => {
  genreStore.fetchGenres()
})

function openNew(): void {
  currentGenre.value = {
    id: undefined,
    name: '',
    slug: '',
    description: '',
    status: 'ACTIVE'
  }
  showModal.value = true
}

function editGenre(genre: Genre): void {
  currentGenre.value = { ...genre }
  showModal.value = true
}

function showNotice(type: 'success' | 'error', message: string): void {
  noticeType.value = type
  noticeMessage.value = message
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    noticeMessage.value = ''
  }, 3000)
}

async function saveGenre(genreData: Genre & { id: number | null }): Promise<void> {
  try {
    // Prepare data without id for new genres
    const saveData = genreData.id
      ? genreData
      : { ...genreData, id: undefined }

    await genreStore.saveGenre(saveData as Genre)
    closeModal()
    showNotice('success', genreData.id ? 'Cập nhật thể loại thành công!' : 'Thêm thể loại thành công!')
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể lưu thể loại')
    console.error(err)
  }
}

async function deleteGenre(id: number): Promise<void> {
  if (!confirm('Bạn có chắc muốn xóa thể loại này?')) return

  try {
    await genreStore.deleteGenre(id)
    showNotice('success', 'Xóa thể loại thành công!')
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể xóa thể loại')
    console.error(err)
  }
}

function closeModal(): void {
  showModal.value = false
  currentGenre.value = null
}

// Reset error on modal open
function handleModalCancel(): void {
  genreStore.resetError()
  closeModal()
}
</script>
