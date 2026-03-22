<template>
  <div class="admin-dashboard min-h-screen p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Quản lý truyện</h1>
        <p class="text-sm text-slate-600">Duyệt, chỉnh sửa và quản lý truyện</p>
      </div>
      <div class="flex items-center gap-3">
        <router-link to="/admin/stories/new">
          <BaseButton class="shadow-sm">Thêm truyện mới</BaseButton>
        </router-link>
        <button
          @click="refreshData"
          class="px-3 py-1.5 border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-white"
        >
          Làm mới
        </button>
      </div>
    </div>

    <div
      v-if="noticeMessage"
      :class="[
        'fixed top-4 right-4 z-[60] max-w-sm border rounded-xl p-3 text-sm shadow-lg',
        noticeType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
      ]"
    >
      {{ noticeMessage }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
      <div class="panel p-4">
        <div class="text-xs uppercase tracking-wide text-slate-500">Tổng truyện</div>
        <div class="text-2xl font-semibold text-slate-900">{{ totalStories }}</div>
      </div>
      <div class="panel p-4">
        <div class="text-xs uppercase tracking-wide text-slate-500">Đang chờ duyệt</div>
        <div class="text-2xl font-semibold text-slate-900">{{ pendingCount }}</div>
      </div>
      <div class="panel p-4">
        <div class="text-xs uppercase tracking-wide text-slate-500">Trang hiện tại</div>
        <div class="text-2xl font-semibold text-slate-900">{{ displayPage }} / {{ totalPages || 1 }}</div>
      </div>
      <div class="panel p-4">
        <div class="text-xs uppercase tracking-wide text-slate-500">Kết quả</div>
        <div class="text-2xl font-semibold text-slate-900">{{ stories.length }}</div>
      </div>
    </div>

    <div class="panel p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex items-center gap-2">
          <button
            @click="setTab('all')"
            :class="tab === 'all' ? 'px-3 py-1.5 rounded-full bg-indigo-600 text-white text-sm shadow-sm' : 'px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm hover:bg-white'"
          >
            Tất cả
          </button>
          <button
            @click="setTab('pending')"
            :class="tab === 'pending' ? 'px-3 py-1.5 rounded-full bg-indigo-600 text-white text-sm shadow-sm' : 'px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 text-sm hover:bg-white'"
          >
            Chờ duyệt
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <input
            v-model="keyword"
            placeholder="Tìm theo tiêu đề..."
            class="px-3 py-1.5 border border-slate-200 rounded-full w-56 bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select v-if="tab === 'all'" v-model="statusFilter" class="px-2 py-1.5 border border-slate-200 rounded-full bg-white/80">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <select v-if="tab === 'all'" v-model="publishFilter" class="px-2 py-1.5 border border-slate-200 rounded-full bg-white/80">
            <option value="">Tất cả xuất bản</option>
            <option value="ONGOING">Đang tiến hành</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
          <select v-model.number="size" class="px-2 py-1.5 border border-slate-200 rounded-full bg-white/80">
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl mb-4 text-sm">
      {{ error }}
    </div>

    <div class="panel overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-100/70 text-left text-slate-600 text-xs uppercase tracking-wide">
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
          <tr v-for="(s, idx) in stories" :key="s.id || idx" class="border-t hover:bg-slate-50/70 transition-colors">
            <td class="p-3 align-top">{{ idx + 1 + page * size }}</td>
            <td class="p-3 align-top">
              <div class="flex items-center gap-2 min-w-0">
                <div
                  class="font-medium text-gray-900 truncate max-w-[280px] min-w-0"
                  v-tooltip="s.title"
                >
                  {{ s.title }}
                </div>
                <span
                  v-if="isNewestCommentStory(s)"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0"
                  v-tooltip="'Bình luận mới nhất'"
                >
                  NEW
                </span>
              </div>
              <div
                class="text-xs text-gray-500 truncate max-w-[320px]"
                v-tooltip="s.slug"
              >
                {{ s.slug }}
              </div>
            </td>
            <td class="p-3 align-top">{{ s.author || s.authorName || 'Ẩn danh' }}</td>
            <td class="p-3 align-top">
              <span :class="statusClass(s.status)" v-tooltip="statusLabel(s.status)">{{ statusLabel(s.status) }}</span>
            </td>
            <td class="p-3 align-top">
              <span :class="publishClass(s.publishStatus)" v-tooltip="publishLabel(s.publishStatus)">{{ publishLabel(s.publishStatus) }}</span>
            </td>
            <td class="p-3 align-top">{{ formatDate(s.createdAt) }}</td>
            <td class="p-3 align-top text-right space-x-2">
              <router-link
                :to="storyDetailLink(s)"
                class="relative inline-flex items-center justify-center w-9 h-9 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                v-tooltip="'Xem'"
                aria-label="Xem"
                @click="markCommentSeen(s)"
              >
                <!-- <span
                  v-if="isNewestCommentStory(s)"
                  class="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 pointer-events-none"
                >
                  
                </span> -->
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                  <circle cx="12" cy="12" r="3.2" />
                </svg>
              </router-link>
              <button
                @click="editStory(s)"
                :disabled="!canEditStory(s)"
                :title="actionTitle(canEditStory(s), 'Bạn chỉ được sửa truyện do chính mình tạo.')"
                class="inline-flex items-center justify-center w-9 h-9 text-slate-700 rounded border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                v-tooltip="'Sửa'"
                aria-label="Sửa"
              >
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M3.5 16.5L15.5 4.5a2.1 2.1 0 0 1 3 3L6.5 19.5 3 20l.5-3.5z" />
                  <path d="M13 6l5 5" />
                </svg>
              </button>
              <button
                v-if="s.status === 'PENDING'"
                @click="approveStory(s)"
                :disabled="!canApproveStory(s)"
                :title="actionTitle(canApproveStory(s), 'Chỉ admin mới có quyền duyệt truyện.')"
                class="px-2 py-1 text-sm bg-emerald-600 text-white rounded shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Duyệt
              </button>
              <button
                v-if="s.status === 'PENDING'"
                @click="rejectStory(s)"
                :disabled="!canApproveStory(s)"
                :title="actionTitle(canApproveStory(s), 'Chỉ admin mới có quyền từ chối truyện.')"
                class="px-2 py-1 text-sm bg-amber-500 text-white rounded shadow-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Từ chối
              </button>
              <button
                @click="removeStory(s)"
                :disabled="!canDeleteStory(s)"
                :title="actionTitle(canDeleteStory(s), 'Bạn chỉ được xóa truyện do chính mình tạo.')"
                class="inline-flex items-center justify-center w-9 h-9 bg-rose-600 text-white rounded shadow-sm hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                v-tooltip="'Xóa'"
                aria-label="Xóa"
              >
                <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.6">
                  <path d="M4 7h16" />
                  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                  <path d="M7 7l1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between px-4 py-3 text-sm text-slate-600 border-t border-slate-200">
        <div>Trang {{ displayPage }} / {{ totalPages || 1 }}</div>
        <div class="space-x-2">
          <button @click="prevPage" :disabled="page <= 0" class="px-3 py-1.5 border border-slate-200 rounded-full disabled:opacity-50 hover:bg-white">Trước</button>
          <button @click="nextPage" :disabled="page + 1 >= totalPages" class="px-3 py-1.5 border border-slate-200 rounded-full disabled:opacity-50 hover:bg-white">Sau</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton } from '../../components'
import { useAuthStore, useStoriesStore } from '@/stores'
import commentsService from '@/services/comments'

const router = useRouter()
const authStore = useAuthStore()
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
const latestCommentByStory = ref({})
const newestCommentStoryId = ref(null)
let latestCommentReq = 0
const COMMENT_SEEN_KEY = 'admin_comment_seen_at'
const seenComments = ref({})
try {
  const raw = localStorage.getItem(COMMENT_SEEN_KEY)
  seenComments.value = raw ? JSON.parse(raw) : {}
} catch {
  seenComments.value = {}
}

const stories = computed(() => (tab.value === 'all' ? storiesStore.stories : pendingStories.value))
const totalPages = computed(() => (tab.value === 'all' ? storiesStore.pagination.totalPages : 1))
const displayPage = computed(() => page.value + 1)
const totalStories = computed(() => storiesStore.pagination.total || storiesStore.stories.length)
const pendingCount = computed(() => pendingStories.value.length)
const isAdmin = computed(() => authStore.isAdmin)
const currentUserId = computed(() => authStore.user?.id)

function getStoryOwnerId(story) {
  if (!story) return null
  return story.authorId ?? story.userId ?? story.ownerId ?? story.createdBy ?? null
}

function isOwner(story) {
  const ownerId = getStoryOwnerId(story)
  const userId = currentUserId.value
  if (ownerId == null || userId == null) return false
  return String(ownerId) === String(userId)
}

function canApproveStory(story) {
  return isAdmin.value && story?.status === 'PENDING'
}

function canEditStory(story) {
  return isAdmin.value || isOwner(story)
}

function canDeleteStory(story) {
  return isAdmin.value || isOwner(story)
}

function actionTitle(isAllowed, message) {
  return isAllowed ? '' : message
}

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

function saveSeenComments() {
  try {
    localStorage.setItem(COMMENT_SEEN_KEY, JSON.stringify(seenComments.value))
  } catch {
    // ignore
  }
}

function isNewestCommentStory(story) {
  if (!story?.id || !newestCommentStoryId.value) return false
  if (String(story.id) !== String(newestCommentStoryId.value)) return false
  const latest = latestCommentByStory.value?.[story.id]
  if (!latest) return false
  const seenAt = seenComments.value?.[story.id]
  if (seenAt && new Date(seenAt) >= new Date(latest)) return false
  return true
}

function markCommentSeen(story) {
  if (!story?.id) return
  const latest = latestCommentByStory.value?.[story.id]
  if (!latest) return
  seenComments.value = { ...seenComments.value, [story.id]: latest }
  saveSeenComments()
}

function refreshData() {
  loadStories()
}

function editStory(story) {
  if (!canEditStory(story)) {
    showNotice('error', 'Bạn chỉ được sửa truyện do chính mình tạo.')
    return
  }
  router.push({ name: 'AdminNewStory', query: { edit: story?.id } })
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
    await loadLatestComments()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Không thể tải danh sách truyện'
  } finally {
    loading.value = false
  }
}

async function loadLatestComments() {
  const reqId = ++latestCommentReq
  const list = stories.value || []
  if (!list.length) {
    latestCommentByStory.value = {}
    newestCommentStoryId.value = null
    return
  }

  const results = await Promise.all(list.map(async (s) => {
    if (!s?.id) return null
    try {
      const data = await commentsService.getAll({
        truyenId: s.id,
        page: 0,
        size: 1,
        sort: 'createdAt',
        sortDir: 'desc'
      })
      const items = normalizePaged(data)
      const latest = items[0]
      if (latest?.createdAt) {
        return { storyId: s.id, createdAt: latest.createdAt }
      }
    } catch {
      return null
    }
    return null
  }))

  if (reqId !== latestCommentReq) return

  const map = {}
  let newest = null
  results.forEach((r) => {
    if (!r) return
    map[r.storyId] = r.createdAt
    if (!newest || new Date(r.createdAt) > new Date(newest.createdAt)) {
      newest = r
    }
  })

  latestCommentByStory.value = map
  newestCommentStoryId.value = newest?.storyId || null
}

async function approveStory(story) {
  if (!canApproveStory(story)) {
    showNotice('error', 'Chỉ admin mới có quyền duyệt truyện.')
    return
  }
  try {
    await storiesStore.approveStory(story.id)
    showNotice('success', 'Duyệt truyện thành công!')
    loadStories()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể duyệt truyện')
  }
}

async function rejectStory(story) {
  if (!canApproveStory(story)) {
    showNotice('error', 'Chỉ admin mới có quyền từ chối truyện.')
    return
  }
  try {
    await storiesStore.rejectStory(story.id)
    showNotice('success', 'Từ chối truyện thành công!')
    loadStories()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể từ chối truyện')
  }
}

async function removeStory(story) {
  if (!canDeleteStory(story)) {
    showNotice('error', 'Bạn chỉ được xóa truyện do chính mình tạo.')
    return
  }
  if (!confirm('Xác nhận xóa truyện này?')) return
  try {
    await storiesStore.deleteStory(story.id)
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
    case 'APPROVED': return 'px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex'
    case 'REJECTED': return 'px-2 py-1 text-xs rounded-full bg-rose-50 text-rose-700 border border-rose-200 whitespace-nowrap inline-flex'
    default: return 'px-2 py-1 text-xs rounded-full bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap inline-flex'
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
    case 'ONGOING': return 'px-2 py-1 text-xs rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap inline-flex'
    case 'COMPLETED': return 'px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex'
    case 'PAUSED': return 'px-2 py-1 text-xs rounded-full bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap inline-flex'
    default: return 'px-2 py-1 text-xs rounded-full bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap inline-flex'
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
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.admin-dashboard {
  font-family: 'Space Grotesk', 'Noto Sans', sans-serif;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #ecfeff 100%);
}

.panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e2e8f0;
  box-shadow: 0 18px 35px -28px rgba(15, 23, 42, 0.45);
  border-radius: 16px;
}

table td, table th { vertical-align: middle }
</style>
