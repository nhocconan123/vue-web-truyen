<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Quản lý truyện</h1>
        <p class="text-sm text-gray-600">Duyệt, chỉnh sửa và quản lý truyện</p>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/admin/stories/new">
          <BaseButton>Thêm truyện mới</BaseButton>
        </router-link>
        <button @click="refreshData" class="px-3 py-1 border rounded text-sm">Làm mới</button>
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

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">Tổng truyện</div>
        <div class="text-2xl font-bold">{{ totalStories }}</div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">Đang chờ duyệt</div>
        <div class="text-2xl font-bold">{{ pendingCount }}</div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">Trang hiện tại</div>
        <div class="text-2xl font-bold">{{ displayPage }} / {{ totalPages || 1 }}</div>
      </div>
      <div class="bg-white p-4 rounded shadow">
        <div class="text-sm text-gray-500">Kết quả</div>
        <div class="text-2xl font-bold">{{ stories.length }}</div>
      </div>
    </div>

    <div class="bg-white rounded shadow p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-2">
          <button
            @click="setTab('all')"
            :class="tab === 'all' ? 'px-3 py-1 rounded bg-blue-600 text-white text-sm' : 'px-3 py-1 rounded border text-sm'"
          >
            Tất cả
          </button>
          <button
            @click="setTab('pending')"
            :class="tab === 'pending' ? 'px-3 py-1 rounded bg-blue-600 text-white text-sm' : 'px-3 py-1 rounded border text-sm'"
          >
            Chờ duyệt
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <input
            v-model="keyword"
            placeholder="Tìm theo tiêu đề..."
            class="px-3 py-1 border rounded w-56"
          />
          <select v-if="tab === 'all'" v-model="statusFilter" class="px-2 py-1 border rounded">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <select v-if="tab === 'all'" v-model="publishFilter" class="px-2 py-1 border rounded">
            <option value="">Tất cả xuất bản</option>
            <option value="ONGOING">Đang tiến hành</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
          <select v-model.number="size" class="px-2 py-1 border rounded">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
      {{ error }}
    </div>

    <div class="bg-white rounded shadow overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-gray-600">
          <tr>
            <th class="p-3">#</th>
            <th class="p-3">Tiêu đề</th>
            <th class="p-3">Tác giả</th>
            <th class="p-3">Trạng thái</th>
            <th class="p-3">Xuất bản</th>
            <th class="p-3">Ngày tạo</th>
            <th class="p-3 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="border-t">
            <td colspan="7" class="p-4 text-center text-gray-500">Đang tải...</td>
          </tr>
          <tr v-else-if="stories.length === 0" class="border-t">
            <td colspan="7" class="p-4 text-center text-gray-500">Không có truyện phù hợp</td>
          </tr>
          <tr v-for="(s, idx) in stories" :key="s.id || idx" class="border-t">
            <td class="p-3 align-top">{{ idx + 1 + page * size }}</td>
            <td class="p-3 align-top">
              <div class="font-medium text-gray-900">{{ s.title }}</div>
              <div class="text-xs text-gray-500">{{ s.slug }}</div>
            </td>
            <td class="p-3 align-top">{{ s.author || s.authorName || 'Ẩn danh' }}</td>
            <td class="p-3 align-top">
              <span :class="statusClass(s.status)">{{ statusLabel(s.status) }}</span>
            </td>
            <td class="p-3 align-top">
              <span :class="publishClass(s.publishStatus)">{{ publishLabel(s.publishStatus) }}</span>
            </td>
            <td class="p-3 align-top">{{ formatDate(s.createdAt) }}</td>
            <td class="p-3 align-top text-right space-x-2">
              <router-link :to="storyDetailLink(s)" class="px-2 py-1 text-sm border rounded">Xem</router-link>
              <button
                v-if="s.publishStatus === 'ONGOING'"
                @click="openAddChapter(s)"
                class="px-2 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Thêm chương
              </button>
              <button @click="editStory(s.id)" class="px-2 py-1 text-sm border rounded">Sửa</button>
              <button
                v-if="s.status === 'PENDING'"
                @click="approveStory(s.id)"
                class="px-2 py-1 text-sm bg-green-600 text-white rounded"
              >
                Duyệt
              </button>
              <button
                v-if="s.status === 'PENDING'"
                @click="rejectStory(s.id)"
                class="px-2 py-1 text-sm bg-yellow-500 text-white rounded"
              >
                Từ chối
              </button>
              <button @click="removeStory(s.id)" class="px-2 py-1 text-sm bg-red-600 text-white rounded">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 text-sm text-gray-600 border-t">
        <div>Trang {{ displayPage }} / {{ totalPages || 1 }}</div>
        <div class="space-x-2">
          <button @click="prevPage" :disabled="page <= 0" class="px-3 py-1 border rounded disabled:opacity-50">Trước</button>
          <button @click="nextPage" :disabled="page + 1 >= totalPages" class="px-3 py-1 border rounded disabled:opacity-50">Sau</button>
        </div>
      </div>
    </div>

    <chapter-modal
      v-if="showChapterModal"
      :chapter="null"
      :story-id="chapterTarget?.id || 0"
      :default-chapter-number="nextChapterNumber"
      @save="saveChapter"
      @cancel="closeChapterModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '../../components'
import { useStoriesStore } from '@/stores'
import storiesService from '@/services/stories'
import ChapterModal from '../components/ChapterModal.vue'

const router = useRouter()
const storiesStore = useStoriesStore()

const tab = ref('all')
const keyword = ref('')
const statusFilter = ref('')
const publishFilter = ref('')
const page = ref(0)
const size = ref(10)
const pendingStories = ref([])
const loading = ref(false)
const error = ref('')
const noticeMessage = ref('')
const noticeType = ref('success')
let noticeTimer
const showChapterModal = ref(false)
const chapterTarget = ref(null)
const nextChapterNumber = ref(1)

const stories = computed(() => (tab.value === 'all' ? storiesStore.stories : pendingStories.value))
const totalPages = computed(() => (tab.value === 'all' ? storiesStore.pagination.totalPages : 1))
const displayPage = computed(() => page.value + 1)
const totalStories = computed(() => storiesStore.pagination.total || storiesStore.stories.length)
const pendingCount = computed(() => pendingStories.value.length)

function refreshData() {
  loadStories()
}

function editStory(id) {
  router.push({ name: 'AdminNewStory', query: { edit: id } })
}

function storyDetailLink(story) {
  const slugOrId = story.slug || story.id
  return { name: 'StoryDetail', params: { id: slugOrId } }
}

function showNotice(type, message) {
  noticeType.value = type
  noticeMessage.value = message
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    noticeMessage.value = ''
  }, 3000)
}

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

async function openAddChapter(story) {
  chapterTarget.value = story
  nextChapterNumber.value = 1

  if (story?.id) {
    try {
      const data = await storiesService.getChaptersMeta(story.id, {
        page: 0,
        size: 1,
        sort: 'chapterNumber',
        sortDir: 'desc'
      })
      const list = normalizePaged(data)
      if (list[0]?.chapterNumber) {
        nextChapterNumber.value = Number(list[0].chapterNumber) + 1
      }
    } catch {
      nextChapterNumber.value = 1
    }
  }

  showChapterModal.value = true
}

function closeChapterModal() {
  showChapterModal.value = false
  chapterTarget.value = null
}

async function saveChapter(chapterData) {
  try {
    await storiesStore.addChapter(chapterData)
    showNotice('success', 'Thêm chương thành công!')
    closeChapterModal()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể thêm chương')
  }
}

function setTab(value) {
  if (tab.value === value) return
  tab.value = value
  page.value = 0
}

async function loadStories() {
  loading.value = true
  error.value = ''
  try {
    if (tab.value === 'all') {
      await storiesStore.fetchStories({
        page: page.value,
        size: size.value,
        sortBy: 'createdAt',
        sortDir: 'desc',
        status: statusFilter.value || undefined,
        publishStatus: publishFilter.value || undefined,
        keyword: keyword.value || undefined
      })
    } else {
      const list = await storiesStore.fetchPendingStories({
        page: page.value,
        size: size.value
      })
      pendingStories.value = Array.isArray(list) ? list : []
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Không thể tải danh sách truyện'
  } finally {
    loading.value = false
  }
}

async function approveStory(id) {
  try {
    await storiesStore.approveStory(id)
    showNotice('success', 'Duyệt truyện thành công!')
    loadStories()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể duyệt truyện')
  }
}

async function rejectStory(id) {
  try {
    await storiesStore.rejectStory(id)
    showNotice('success', 'Từ chối truyện thành công!')
    loadStories()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể từ chối truyện')
  }
}

async function removeStory(id) {
  if (!confirm('Xác nhận xóa truyện này?')) return
  try {
    await storiesStore.deleteStory(id)
    showNotice('success', 'Xóa truyện thành công!')
    loadStories()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể xóa truyện')
  }
}

function statusLabel(status) {
  switch (status) {
    case 'APPROVED': return 'Đã duyệt'
    case 'REJECTED': return 'Từ chối'
    default: return 'Chờ duyệt'
  }
}

function statusClass(status) {
  switch (status) {
    case 'APPROVED': return 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'
    case 'REJECTED': return 'px-2 py-1 text-xs rounded bg-red-100 text-red-700'
    default: return 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700'
  }
}

function publishLabel(status) {
  switch (status) {
    case 'ONGOING': return 'Đang tiến hành'
    case 'COMPLETED': return 'Hoàn thành'
    case 'PAUSED': return 'Tạm dừng'
    default: return 'Không rõ'
  }
}

function publishClass(status) {
  switch (status) {
    case 'ONGOING': return 'px-2 py-1 text-xs rounded bg-blue-100 text-blue-700'
    case 'COMPLETED': return 'px-2 py-1 text-xs rounded bg-green-100 text-green-700'
    case 'PAUSED': return 'px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700'
    default: return 'px-2 py-1 text-xs rounded bg-gray-100 text-gray-700'
  }
}

function formatDate(value) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
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

watch([tab, page, size, keyword, statusFilter, publishFilter], () => {
  loadStories()
}, { immediate: true })
</script>

<style scoped>
table td, table th { vertical-align: middle }
</style>
