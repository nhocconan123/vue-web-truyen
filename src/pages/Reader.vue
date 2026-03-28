<template>
  <div :class="['reader-shell min-h-screen', themeClass]" :style="{ colorScheme: readerColorScheme }">
    <header class="reader-header">
      <div class="reader-header-inner">
        <div class="reader-breadcrumb text-xs text-gray-500 mb-2">
          <router-link to="/" class="reader-breadcrumb-link">Trang chủ</router-link>
          <span class="mx-2">/</span>
          <router-link v-if="story?.slug || story?.id" :to="storyDetailLink" class="reader-breadcrumb-link">
            {{ story?.title || 'Truyện' }}
          </router-link>
          <span class="mx-2">/</span>
          <span v-tooltip="chapterTitle">{{ chapterTitle || 'Đang tải...' }}</span>
        </div>

        <div class="reader-hero">
          <div class="reader-hero-copy min-w-0">
            <h1 class="reader-story-title">{{ story?.title || 'Truyện' }}</h1>
            <p class="reader-chapter-subtitle" v-tooltip="chapterTitle">{{ chapterTitle }}</p>
          </div>
          <div class="reader-nav-controls">
            <button
              @click="goPrev"
              :disabled="!hasPrev"
              class="reader-nav-button reader-nav-button--ghost"
            >
              Chương trước
            </button>
            <div class="reader-chapter-select" v-tooltip="selectedChapterLabel">
              <select
                v-model.number="selectedChapterNumber"
                class="reader-select"
                :title="selectedChapterLabel"
                :aria-label="selectedChapterLabel"
              >
                <option v-for="c in chapters" :key="c.id || c.chapterNumber" :value="c.chapterNumber">
                  {{ formatChapterLabel(c) }}
                </option>
              </select>
            </div>
            <button
              @click="goNext"
              :disabled="!hasNext"
              class="reader-nav-button reader-nav-button--primary"
            >
              Chương sau
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="reader-main">
      <section class="reading-panel">
        <div class="reader-toolbar">
          <div class="reader-meta text-sm">
            <span v-if="chapter?.createdAt">Cập nhật: {{ formatTime(chapter.createdAt) }}</span>
            <span v-if="stats?.chapterViews">Lượt xem chương: {{ stats.chapterViews }}</span>
            <span v-if="stats?.storyViews">Lượt xem truyện: {{ stats.storyViews }}</span>
          </div>

          <div class="reader-settings">
            <div class="reader-setting-group">
              <span class="reader-setting-label">Cỡ chữ</span>
              <div class="reader-setting-actions">
                <button @click="decreaseFont" class="reader-setting-button">A-</button>
                <button @click="increaseFont" class="reader-setting-button">A+</button>
              </div>
            </div>

            <div class="reader-setting-group">
              <label class="reader-setting-label" for="reader-line-height">Giãn dòng</label>
              <select id="reader-line-height" v-model="lineHeight" class="reader-setting-select">
                <option value="1.7">1.7</option>
                <option value="1.9">1.9</option>
                <option value="2.1">2.1</option>
              </select>
            </div>

            <div class="reader-setting-group">
              <label class="reader-setting-label" for="reader-theme">Nền</label>
              <select id="reader-theme" v-model="theme" class="reader-setting-select">
                <option value="light">Sáng</option>
                <option value="sepia">Sepia</option>
                <option value="dark">Tối</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-sm text-gray-500">Đang tải chương...</div>
        <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

        <article v-else :style="contentStyle" class="reading-content">
          <div v-html="renderedContent"></div>
        </article>

        <div class="reader-footer-nav text-sm">
          <div>Chương {{ chapter?.chapterNumber || '' }}</div>
          <div class="reader-footer-buttons">
            <button @click="goPrev" :disabled="!hasPrev" class="reader-nav-button reader-nav-button--ghost">Chương trước</button>
            <button @click="goNext" :disabled="!hasNext" class="reader-nav-button reader-nav-button--primary">Chương sau</button>
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
                <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                  <img v-if="c.avatar" :src="c.avatar" alt="" class="w-full h-full object-cover" />
                </div>
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

const selectedChapterLabel = computed(() => {
  const targetNumber = Number(selectedChapterNumber.value || chapter.value?.chapterNumber || chapterNumber.value || 0)
  const currentChapter = chapters.value.find((item) => Number(item.chapterNumber) === targetNumber)
  if (currentChapter) return formatChapterLabel(currentChapter)
  return chapterTitle.value || ''
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

const readerColorScheme = computed(() => (theme.value === 'dark' ? 'dark' : 'light'))

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

function formatChapterLabel(chapterItem) {
  if (!chapterItem) return ''
  return `Chương ${chapterItem.chapterNumber}: ${chapterItem.title || ''}`.trim()
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
.reader-shell {
  background: var(--reader-shell-bg);
  color: var(--reader-body);
  transition: background-color 180ms ease, color 180ms ease;
}

.reader-header {
  position: sticky;
  top: 0;
  z-index: 40;
  border-bottom: 1px solid var(--reader-border);
  backdrop-filter: blur(18px);
  background: var(--reader-header-bg);
}

.reader-header-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1rem 0.875rem;
}

.reader-main {
  max-width: 68rem;
  margin: 0 auto;
  padding: 1.25rem 1rem 2rem;
}

.reading-panel {
  background: var(--reading-bg);
  color: var(--reading-text);
  border: 1px solid var(--reader-border);
  border-radius: 1.5rem;
  box-shadow: 0 24px 50px -34px rgba(15, 23, 42, 0.35);
  padding: 1.1rem;
}

.reader-breadcrumb {
  line-height: 1.55;
  word-break: break-word;
  color: var(--reader-muted);
}

.reader-breadcrumb-link {
  color: inherit;
  text-decoration: none;
  transition: color 150ms ease;
}

.reader-breadcrumb-link:hover {
  color: var(--reader-heading);
}

.reader-hero {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.reader-hero-copy {
  min-width: 0;
}

.reader-story-title {
  margin: 0;
  color: var(--reader-heading);
  font-size: clamp(1.4rem, 4.8vw, 2rem);
  line-height: 1.2;
  font-weight: 700;
  word-break: break-word;
}

.reader-chapter-subtitle {
  margin-top: 0.4rem;
  color: var(--reader-subtle);
  line-height: 1.55;
  word-break: break-word;
}

.reader-nav-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  width: 100%;
  align-items: stretch;
}

.reader-nav-button,
.reader-chapter-select,
.reader-select {
  width: 100%;
  min-width: 0;
}

.reader-chapter-select {
  overflow: hidden;
}

.reader-select {
  max-width: 100%;
}

.reader-nav-button {
  min-height: 2.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.72rem 0.95rem;
  border-radius: 0.95rem;
  border: 1px solid var(--reader-control-border);
  background: var(--reader-control-bg);
  color: var(--reader-control-text);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
  transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
}

.reader-nav-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.reader-nav-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 25px -18px rgba(37, 99, 235, 0.45);
}

.reader-nav-button--ghost {
  background: var(--reader-control-soft);
}

.reader-nav-button--primary {
  border-color: transparent;
  background: linear-gradient(135deg, var(--reader-primary), var(--reader-primary-strong));
  color: #ffffff;
}

.reader-select,
.reader-setting-select,
.reader-setting-button {
  min-height: 2.85rem;
  border: 1px solid var(--reader-control-border);
  border-radius: 0.95rem;
  background: var(--reader-control-bg);
  color: var(--reader-control-text);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.reader-select,
.reader-setting-select {
  padding: 0.72rem 0.9rem;
}

.reader-toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 0.95rem;
  margin-bottom: 1.25rem;
  border: 1px solid var(--reader-border);
  border-radius: 1.15rem;
  background: var(--reader-toolbar-bg);
}

.reader-meta {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.reader-meta span {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--reader-border);
  background: var(--reader-chip-bg);
  color: var(--reader-subtle);
}

.reader-settings {
  display: grid;
  gap: 0.75rem;
}

.reader-setting-group {
  display: grid;
  gap: 0.55rem;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--reader-border);
  border-radius: 1rem;
  background: var(--reader-control-soft);
}

.reader-setting-label {
  color: var(--reader-subtle);
  font-size: 0.92rem;
  font-weight: 600;
}

.reader-setting-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.reader-setting-button {
  padding: 0.72rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.reader-select,
.reader-setting-select {
  width: 100%;
}

.reader-select:focus,
.reader-setting-select:focus,
.reader-setting-button:focus {
  outline: none;
  border-color: var(--reader-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.16);
}

.reader-footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  margin-top: 1.25rem;
  border-top: 1px solid var(--reader-border);
}

.reader-footer-buttons {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
  width: 100%;
}

.reading-content :deep(p) {
  margin-bottom: 1rem;
}

.reader-shell :deep(.bg-white) {
  background-color: var(--reader-card-bg);
}

.reader-shell :deep(.text-gray-900) {
  color: var(--reader-heading);
}

.reader-shell :deep(.text-gray-800) {
  color: var(--reader-body);
}

.reader-shell :deep(.text-gray-700) {
  color: var(--reader-subtle);
}

.reader-shell :deep(.text-gray-600),
.reader-shell :deep(.text-gray-500),
.reader-shell :deep(.text-gray-400) {
  color: var(--reader-muted);
}

.reader-shell :deep(.border),
.reader-shell :deep(.border-t) {
  border-color: var(--reader-border);
}

@media (max-width: 639px) {
  .reader-main {
    padding-top: 1rem;
  }

  .reading-panel {
    border-radius: 1.15rem;
    padding: 0.95rem;
  }

  .reader-select,
  .reader-setting-select,
  .reader-setting-button,
  .reader-nav-button {
    font-size: 16px;
  }
}

@media (min-width: 640px) {
  .reader-header-inner {
    padding: 1rem 1.25rem 0.95rem;
  }

  .reader-main {
    padding: 1.5rem 1.25rem 2.5rem;
  }

  .reader-nav-controls {
    grid-template-columns: auto minmax(18rem, 24rem) auto;
    width: auto;
  }

  .reader-nav-button {
    width: auto;
  }

  .reader-chapter-select {
    width: 100%;
  }

  .reader-meta {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.75rem 1rem;
  }

  .reader-settings {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .reader-footer-nav {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .reader-footer-buttons {
    display: flex;
    width: auto;
    gap: 0.5rem;
  }
}

@media (min-width: 768px) {
  .reader-hero {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .reader-toolbar {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
  }

  .reader-meta {
    max-width: 48%;
  }

  .reader-settings {
    max-width: 52%;
  }
}

.theme-light {
  --reading-bg: #ffffff;
  --reading-text: #1f2937;
  --reader-shell-bg: linear-gradient(180deg, #f7faff 0%, #eef2ff 100%);
  --reader-header-bg: rgba(255, 255, 255, 0.88);
  --reader-toolbar-bg: rgba(248, 250, 252, 0.92);
  --reader-card-bg: #ffffff;
  --reader-heading: #0f172a;
  --reader-body: #1f2937;
  --reader-muted: #64748b;
  --reader-subtle: #475569;
  --reader-border: rgba(148, 163, 184, 0.3);
  --reader-chip-bg: rgba(255, 255, 255, 0.82);
  --reader-control-bg: #ffffff;
  --reader-control-soft: #f8fafc;
  --reader-control-border: #dbe4ee;
  --reader-control-text: #0f172a;
  --reader-primary: #2563eb;
  --reader-primary-strong: #1d4ed8;
}

.theme-sepia {
  --reading-bg: #f7f1e1;
  --reading-text: #4b3f2f;
  --reader-shell-bg: linear-gradient(180deg, #f6efe1 0%, #eadfcb 100%);
  --reader-header-bg: rgba(248, 241, 226, 0.9);
  --reader-toolbar-bg: rgba(247, 239, 225, 0.88);
  --reader-card-bg: #fbf5e8;
  --reader-heading: #3d3123;
  --reader-body: #4b3f2f;
  --reader-muted: #8b7355;
  --reader-subtle: #66533e;
  --reader-border: rgba(120, 93, 63, 0.22);
  --reader-chip-bg: rgba(255, 250, 240, 0.82);
  --reader-control-bg: #fff8ec;
  --reader-control-soft: rgba(255, 249, 238, 0.82);
  --reader-control-border: #dcc7a7;
  --reader-control-text: #3d3123;
  --reader-primary: #b7791f;
  --reader-primary-strong: #975a16;
}

.theme-dark {
  --reading-bg: #111827;
  --reading-text: #e5e7eb;
  --reader-shell-bg: linear-gradient(180deg, #020617 0%, #0f172a 100%);
  --reader-header-bg: rgba(5, 10, 24, 0.88);
  --reader-toolbar-bg: rgba(15, 23, 42, 0.86);
  --reader-card-bg: #0f172a;
  --reader-heading: #f8fafc;
  --reader-body: #e2e8f0;
  --reader-muted: #94a3b8;
  --reader-subtle: #cbd5e1;
  --reader-border: rgba(71, 85, 105, 0.55);
  --reader-chip-bg: rgba(15, 23, 42, 0.86);
  --reader-control-bg: #0f172a;
  --reader-control-soft: rgba(15, 23, 42, 0.72);
  --reader-control-border: #334155;
  --reader-control-text: #f8fafc;
  --reader-primary: #3b82f6;
  --reader-primary-strong: #2563eb;
}
</style>
