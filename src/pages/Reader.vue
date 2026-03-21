<template>
  <div :class="['min-h-screen', themeClass]">
    <header class="sticky top-0 z-40 border-b backdrop-blur bg-white/80">
      <div class="max-w-6xl mx-auto px-4 py-3">
        <div class="text-xs text-gray-500 mb-2">
          <router-link to="/" class="hover:text-blue-600">Trang chủ</router-link>
          <span class="mx-2">/</span>
          <router-link v-if="story?.slug || story?.id" :to="storyDetailLink" class="hover:text-blue-600">
            {{ story?.title || 'Truyện' }}
          </router-link>
          <span class="mx-2">/</span>
          <span>{{ chapterTitle || 'Đang tải...' }}</span>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 class="text-lg font-semibold text-gray-900">{{ story?.title || 'Truyện' }}</h1>
            <p class="text-sm text-gray-600">{{ chapterTitle }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              @click="goPrev"
              :disabled="!hasPrev"
              class="px-3 py-1 border rounded text-sm disabled:opacity-50"
            >
              Chương trước
            </button>
            <select v-model.number="selectedChapterNumber" class="px-2 py-1 border rounded text-sm">
              <option v-for="c in chapters" :key="c.id || c.chapterNumber" :value="c.chapterNumber">
                Chương {{ c.chapterNumber }}: {{ c.title }}
              </option>
            </select>
            <button
              @click="goNext"
              :disabled="!hasNext"
              class="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
            >
              Chương sau
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-8">
      <section class="reading-panel border rounded-2xl shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div class="text-sm text-gray-500 space-x-4">
            <span v-if="chapter?.createdAt">Cập nhật: {{ formatTime(chapter.createdAt) }}</span>
            <span v-if="stats?.chapterViews">Lượt xem chương: {{ stats.chapterViews }}</span>
            <span v-if="stats?.storyViews">Lượt xem truyện: {{ stats.storyViews }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span class="text-gray-500">Cỡ chữ</span>
            <button @click="decreaseFont" class="px-2 py-1 border rounded">A-</button>
            <button @click="increaseFont" class="px-2 py-1 border rounded">A+</button>

            <span class="text-gray-500 ml-2">Giãn dòng</span>
            <select v-model="lineHeight" class="px-2 py-1 border rounded">
              <option value="1.7">1.7</option>
              <option value="1.9">1.9</option>
              <option value="2.1">2.1</option>
            </select>

            <span class="text-gray-500 ml-2">Nền</span>
            <select v-model="theme" class="px-2 py-1 border rounded">
              <option value="light">Sáng</option>
              <option value="sepia">Sepia</option>
              <option value="dark">Tối</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-gray-500">Đang tải chương...</div>
        <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

        <article v-else :style="contentStyle" class="reading-content">
          <div v-html="renderedContent"></div>
        </article>

        <div class="mt-8 flex items-center justify-between text-sm text-gray-600">
          <div>Chương {{ chapter?.chapterNumber || '' }}</div>
          <div class="space-x-2">
            <button @click="goPrev" :disabled="!hasPrev" class="px-3 py-1 border rounded">Chương trước</button>
            <button @click="goNext" :disabled="!hasNext" class="px-3 py-1 bg-blue-600 text-white rounded">Chương sau</button>
          </div>
        </div>
      </section>

      <section class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white p-4 rounded shadow">
            <h3 class="font-semibold mb-3">Bình luận ({{ comments.length }})</h3>
            <div v-if="comments.length === 0" class="text-sm text-gray-500">Chưa có bình luận.</div>
            <div v-else class="space-y-3">
              <div v-for="c in comments" :key="c.id" class="flex gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ c.username || 'Người dùng' }}</div>
                  <div class="text-sm text-gray-700">{{ c.content }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ formatTime(c.createdAt) }}</div>
                </div>
              </div>
            </div>
            <div class="mt-4 border-t pt-4">
              <textarea
                v-model="newComment"
                rows="3"
                class="w-full p-2 border rounded"
                placeholder="Viết bình luận..."
              ></textarea>
              <div class="mt-2 text-right">
                <button @click="postComment" class="px-4 py-1 bg-blue-600 text-white rounded">Gửi</button>
              </div>
              <p v-if="commentError" class="text-xs text-red-600 mt-1">{{ commentError }}</p>
            </div>
          </div>
        </div>

        <aside class="space-y-4">
          <div class="bg-white p-4 rounded shadow">
            <h4 class="font-semibold mb-2">Thông tin truyện</h4>
            <p class="text-sm text-gray-600">{{ story?.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ story?.slug }}</p>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useStoriesStore } from '../stores'
import readService from '../services/read'
import storiesService from '../services/stories'
import commentsService from '../services/comments'
import readingHistoryService from '../services/readingHistory'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const storiesStore = useStoriesStore()

const story = ref(null)
const chapter = ref(null)
const nav = ref(null)
const stats = ref(null)
const chapters = ref([])
const comments = ref([])
const newComment = ref('')
const commentError = ref('')
const loading = ref(false)
const error = ref('')

const fontSize = ref(18)
const lineHeight = ref('1.9')
const theme = ref('light')

const storySlug = computed(() => String(route.params.storySlug || ''))
const chapterSlug = computed(() => String(route.params.chapterSlug || ''))
const legacyStoryId = computed(() => Number(route.params.id || 0))
const legacyChapterId = computed(() => Number(route.params.chapter || 0))

const chapterNumber = computed(() => {
  const raw = chapterSlug.value
  if (!raw) return 0
  const match = raw.match(/\d+/)
  return match ? Number(match[0]) : 0
})

const selectedChapterNumber = ref(null)

const chapterTitle = computed(() => {
  if (!chapter.value) return ''
  return `Chương ${chapter.value.chapterNumber}: ${chapter.value.title}`
})

const storyDetailLink = computed(() => {
  if (story.value?.slug) return { name: 'StoryDetail', params: { id: story.value.slug } }
  return { name: 'StoryDetail', params: { id: story.value?.id } }
})

const themeClass = computed(() => ({
  'theme-light': theme.value === 'light',
  'theme-sepia': theme.value === 'sepia',
  'theme-dark': theme.value === 'dark'
}))

const contentStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: lineHeight.value
}))

const hasPrev = computed(() => (nav.value?.prev?.chapterNumber ?? getPrevFromList()) != null)
const hasNext = computed(() => (nav.value?.next?.chapterNumber ?? getNextFromList()) != null)

const renderedContent = computed(() => formatContent(chapter.value?.content || ''))

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatContent(raw) {
  if (!raw) return ''
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw)
  if (looksLikeHtml) return raw
  return raw
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

function getPrevFromList() {
  const idx = chapters.value.findIndex(c => c.chapterNumber === chapter.value?.chapterNumber)
  if (idx > 0) return chapters.value[idx - 1].chapterNumber
  return null
}

function getNextFromList() {
  const idx = chapters.value.findIndex(c => c.chapterNumber === chapter.value?.chapterNumber)
  if (idx >= 0 && idx < chapters.value.length - 1) return chapters.value[idx + 1].chapterNumber
  return null
}

function goToChapter(num) {
  if (!storySlug.value || !num) return
  router.push({ name: 'Reader', params: { storySlug: storySlug.value, chapterSlug: String(num) } })
}

function goPrev() {
  const prevNum = nav.value?.prev?.chapterNumber ?? getPrevFromList()
  if (prevNum == null) return
  goToChapter(prevNum)
}

function goNext() {
  const nextNum = nav.value?.next?.chapterNumber ?? getNextFromList()
  if (nextNum == null) return
  goToChapter(nextNum)
}

function increaseFont() {
  fontSize.value += 2
}

function decreaseFont() {
  if (fontSize.value > 12) fontSize.value -= 2
}

function formatTime(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

async function loadComments() {
  if (!chapter.value?.id) return
  try {
    const data = await commentsService.getAll({ page: 0, size: 20, chapterId: chapter.value.id })
    comments.value = normalizePaged(data)
  } catch {
    comments.value = []
  }
}

async function postComment() {
  commentError.value = ''
  if (!authStore.isAuthenticated) {
    commentError.value = 'Vui lòng đăng nhập để bình luận.'
    return
  }
  if (!newComment.value.trim()) return
  try {
    await commentsService.create({
      truyenId: story.value?.id,
      chapterId: chapter.value?.id,
      content: newComment.value.trim()
    })
    newComment.value = ''
    await loadComments()
  } catch (e) {
    commentError.value = e.message || 'Không thể gửi bình luận.'
  }
}

async function loadChaptersMeta() {
  if (!story.value?.id) return
  try {
    const data = await storiesService.getChaptersMeta(story.value.id, {
      sort: 'chapterNumber',
      sortDir: 'asc',
      page: 0,
      size: 200
    })
    chapters.value = normalizePaged(data)
  } catch {
    try {
      const data = await storiesService.getChapters(story.value.id, {
        page: 0,
        size: 200
      })
      chapters.value = normalizePaged(data)
    } catch {
      chapters.value = []
    }
  }
}

async function ensureLegacyRedirect() {
  if (storySlug.value) return false
  if (!legacyStoryId.value || !legacyChapterId.value) return false
  try {
    const legacyStory = await storiesService.getById(legacyStoryId.value)
    const legacyChapter = await storiesService.getChapterById(legacyChapterId.value)
    if (legacyStory?.slug && legacyChapter?.chapterNumber) {
      router.replace({
        name: 'Reader',
        params: { storySlug: legacyStory.slug, chapterSlug: String(legacyChapter.chapterNumber) }
      })
      return true
    }
  } catch {
    return false
  }
  return false
}

async function loadReadFallback() {
  const storyData = await storiesService.getBySlug(storySlug.value)
  story.value = storyData
  await loadChaptersMeta()

  const target = chapters.value.find((c) => Number(c.chapterNumber) === Number(chapterNumber.value))
  if (!target?.id) {
    throw new Error('Không tìm thấy chương này.')
  }
  const chapterData = await storiesService.getChapterById(target.id)
  chapter.value = chapterData

  const index = chapters.value.findIndex((c) => c.id === target.id)
  const prev = index > 0 ? chapters.value[index - 1] : null
  const next = index >= 0 && index < chapters.value.length - 1 ? chapters.value[index + 1] : null
  nav.value = {
    prev: prev ? { chapterNumber: prev.chapterNumber } : { chapterNumber: null, url: null },
    next: next ? { chapterNumber: next.chapterNumber } : { chapterNumber: null, url: null }
  }
  stats.value = null
}

async function loadRead() {
  loading.value = true
  error.value = ''
  let usedFallback = false
  try {
    if (await ensureLegacyRedirect()) return
    if (!storySlug.value || !chapterNumber.value) {
      error.value = 'Đường dẫn không hợp lệ.'
      return
    }

    try {
      const data = await readService.getChapter(storySlug.value, chapterNumber.value)
      story.value = data.story
      chapter.value = data.chapter
      nav.value = data.nav || null
      stats.value = data.stats || null
    } catch (err) {
      usedFallback = true
      await loadReadFallback()
    }

    selectedChapterNumber.value = chapter.value?.chapterNumber || chapterNumber.value
    if (!usedFallback) {
      await loadChaptersMeta()
    }
    await loadComments()

    if (authStore.isAuthenticated) {
      try {
        await readService.markRead(storySlug.value, chapterNumber.value)
      } catch {
        if (chapter.value?.id) {
          try {
            await readingHistoryService.upsert(chapter.value.id)
          } catch {
            // ignore
          }
        }
        if (story.value?.id) {
          await storiesStore.incrementView(story.value.id)
        }
      }
    } else if (story.value?.id) {
      await storiesStore.incrementView(story.value.id)
    }

    if (story.value?.title && chapter.value?.chapterNumber) {
      document.title = `${story.value.title} - Chương ${chapter.value.chapterNumber}`
    }
  } catch (e) {
    error.value = e.message || 'Không thể tải chương.'
  } finally {
    loading.value = false
  }
}

watch(
  () => route.fullPath,
  () => {
    loadRead()
  }
)

watch(
  () => chapterNumber.value,
  (val) => {
    if (val) selectedChapterNumber.value = val
  }
)

watch(selectedChapterNumber, (val) => {
  if (!val || val === chapterNumber.value) return
  goToChapter(val)
})

onMounted(loadRead)
</script>

<style scoped>
.reading-panel {
  background: var(--reading-bg);
  color: var(--reading-text);
}

.reading-content :deep(p) {
  margin-bottom: 1rem;
}

.theme-light {
  --reading-bg: #ffffff;
  --reading-text: #1f2937;
  background: #f5f5f5;
}

.theme-sepia {
  --reading-bg: #f7f1e1;
  --reading-text: #4b3f2f;
  background: #efe6d3;
}

.theme-dark {
  --reading-bg: #111827;
  --reading-text: #e5e7eb;
  background: #0f172a;
}
</style>
