<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">{{ isEditMode ? 'Chỉnh sửa truyện' : 'Thêm truyện mới' }}</h1>
      <router-link to="/admin" class="text-gray-600 hover:text-gray-800">← Quay lại</router-link>
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

    <!-- Step indicator -->
    <div class="mb-6">
      <div class="flex items-center space-x-4">
        <div :class="['flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                     step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">
          1
        </div>
        <span :class="step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-600'">Thông tin truyện</span>

        <div class="flex-1 h-px bg-gray-300"></div>

        <div :class="['flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                     step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600']">
          2
        </div>
        <span :class="step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-600'">Thêm chương</span>
      </div>
    </div>

    <!-- Step 1: Story Information -->
    <div v-if="step === 1" class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Thông tin truyện</h2>

      <form @submit.prevent="submitStory" class="space-y-4">
        <FormField label="Tiêu đề" required>
          <BaseInput
            v-model="storyForm.title"
            placeholder="VD: Đấu La Đại Lục"
            required
          />
        </FormField>

        <FormField label="Tác giả">
          <BaseInput
            v-model="storyForm.authorName"
            placeholder="Để trống sẽ lấy tên đăng nhập"
          />
        </FormField>

        <FormField label="Slug" required>
          <BaseInput
            v-model="storyForm.slug"
            placeholder="VD: dau-la-dai-luc"
            required
          />
          <p class="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
        </FormField>

        <FormField label="Thể loại">
          <div v-if="genreStore.loading" class="text-sm text-gray-500">Đang tải thể loại...</div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label
              v-for="g in genres"
              :key="g.id"
              class="flex items-center gap-2 text-sm text-gray-700 border rounded px-3 py-2 hover:bg-gray-50"
            >
              <input type="checkbox" :value="g.id" v-model="storyForm.genreIds" />
              <span>{{ g.name }}</span>
            </label>
          </div>
        </FormField>

        <FormField label="Mô tả">
          <BaseTextarea
            v-model="storyForm.description"
            rows="4"
            placeholder="Tóm tắt nội dung truyện..."
          />
        </FormField>

        <FormField label="Ảnh bìa">
          <BaseInput
            v-model="storyForm.coverImage"
            placeholder="URL ảnh bìa"
            type="url"
          />
        </FormField>

        <FormField label="Trạng thái xuất bản" required>
          <select
            v-model="storyForm.publishStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          >
            <option value="ONGOING">Đang tiến hành</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
          </select>
        </FormField>

        <div class="flex justify-end space-x-3 pt-4">
          <router-link to="/admin" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Hủy
          </router-link>
          <button
            v-if="isEditMode"
            type="button"
            @click="goToChapters"
            class="px-4 py-2 border border-indigo-200 rounded-lg text-indigo-600 hover:bg-indigo-50"
          >
            Thêm chương
          </button>
          <BaseButton
            type="submit"
            :disabled="isSavingStory"
            class="px-6 py-2"
          >
            {{ isSavingStory ? (isEditMode ? 'Đang cập nhật...' : 'Đang tạo...') : (isEditMode ? 'Cập nhật truyện' : 'Tạo truyện') }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Step 2: Add Chapters -->
    <div v-if="step === 2" class="space-y-6">
      <!-- Story Info Summary -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-2">{{ currentStory?.title }}</h3>
        <p class="text-gray-600 mb-4">{{ currentStory?.description }}</p>
        <div class="flex items-center space-x-4 text-sm">
          <span :class="getStatusClass(currentStory?.status)">
            {{ getStatusText(currentStory?.status) }}
          </span>
          <span :class="getPublishStatusClass(currentStory?.publishStatus)">
            {{ getPublishStatusText(currentStory?.publishStatus) }}
          </span>
        </div>
      </div>

      <!-- Add Chapter Form -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Thêm chương mới</h3>

        <form @submit.prevent="addChapter" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Số chương" required>
              <BaseInput
                v-model.number="chapterForm.chapterNumber"
                type="number"
                min="1"
                placeholder="1"
                required
              />
            </FormField>

            <FormField label="Tiêu đề chương" required>
              <BaseInput
                v-model="chapterForm.title"
                placeholder="VD: Chương 1: Bắt đầu hành trình"
                required
              />
            </FormField>
          </div>

          <FormField label="Nội dung chương" required>
            <BaseTextarea
              v-model="chapterForm.content"
              rows="10"
              placeholder="Nhập nội dung chương..."
              required
            />
          </FormField>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="step = 1"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ← Quay lại
            </button>
            <BaseButton
              type="submit"
              :disabled="storiesStore.addingChapter"
            >
              {{ storiesStore.addingChapter ? 'Đang thêm...' : 'Thêm chương' }}
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Chapters List -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Danh sách chương ({{ chapters.length }})</h3>

        <div v-if="chapters.length === 0" class="text-center text-gray-500 py-8">
          Chưa có chương nào
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="chapter in chapters"
            :key="chapter.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
          >
            <div>
              <span class="font-medium">Chương {{ chapter.chapterNumber }}:</span>
              <span class="ml-2">{{ chapter.title }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">
                {{ chapter.viewCount || 0 }} lượt xem
              </span>
              <button
                @click="editChapter(chapter)"
                class="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sửa
              </button>
              <button
                @click="deleteChapter(chapter.id!)"
                class="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chapter Modal -->
    <chapter-modal
      v-if="showChapterModal"
      :chapter="editingChapter"
      :story-id="currentStory?.id || 0"
      @save="saveChapter"
      @cancel="closeChapterModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStoriesStore, useGenreStore, type Story, type Chapter } from '@/stores'
import { BaseInput, BaseTextarea, FormField, BaseButton } from '@/components'
import ChapterModal from '../components/ChapterModal.vue'
import truyenGenresService from '@/services/truyenGenres'

const route = useRoute()
const storiesStore = useStoriesStore()
const genreStore = useGenreStore()
const genres = computed(() => genreStore.genres)

// Step management
const step = ref(1)
const noticeMessage = ref('')
const noticeType = ref<'success' | 'error'>('success')
let noticeTimer: number | undefined
const savingStory = ref(false)

const editId = computed(() => {
  const raw = route.query.edit
  if (raw == null) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
})
const isEditMode = computed(() => editId.value != null)
const isSavingStory = computed(() => storiesStore.creatingStory || savingStory.value)

// Form data
const storyForm = ref<Omit<Story, 'id'>>({
  title: '',
  authorName: '',
  genreIds: [],
  slug: '',
  description: '',
  coverImage: '',
  publishStatus: 'ONGOING'
})

const chapterForm = ref<Omit<Chapter, 'id'>>({
  truyenId: 0,
  chapterNumber: 1,
  title: '',
  content: ''
})

// Modal management
const showChapterModal = ref(false)
const editingChapter = ref<Chapter | null>(null)

const currentStory = computed(() => storiesStore.currentStory)
const chapters = computed(() => storiesStore.chapters)

function showNotice(type: 'success' | 'error', message: string): void {
  noticeType.value = type
  noticeMessage.value = message
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    noticeMessage.value = ''
  }, 3000)
}

function normalizePaged(payload: any) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

function normalizeGenreIdsInput(input: any): number[] {
  if (!Array.isArray(input)) return []
  const ids = input
    .map((item) => {
      if (typeof item === 'number') return item
      if (typeof item === 'string') {
        const parsed = Number(item)
        return Number.isFinite(parsed) ? parsed : null
      }
      if (item && typeof item === 'object') {
        return item.genreId ?? item.id ?? item.value ?? null
      }
      return null
    })
    .filter((id) => Number.isFinite(id))
    .map((id) => Number(id))
  return Array.from(new Set(ids))
}

// Auto-generate slug from title
watch(() => storyForm.value.title, (newTitle) => {
  if (newTitle && !storyForm.value.slug) {
    storyForm.value.slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
})

// Initialize
onMounted(() => {
  storiesStore.resetError()
  if (!genreStore.genres.length) {
    genreStore.fetchGenres()
  }
})

async function loadStoryForEdit(): Promise<void> {
  if (!isEditMode.value || !editId.value) return
  try {
    const story = await storiesStore.fetchStoryById(editId.value)
    if (!story) return

    storiesStore.setCurrentStory(story)
    storyForm.value = {
      title: story.title || '',
      authorName: story.authorName || story.author || '',
      genreIds: normalizeGenreIdsInput(story.genreIds),
      slug: story.slug || '',
      description: story.description || '',
      coverImage: story.coverImage || '',
      publishStatus: story.publishStatus || 'ONGOING'
    }

    if (!storyForm.value.genreIds.length && story.id) {
      const tg = await truyenGenresService.getByTruyen(story.id)
      const ids = normalizePaged(tg).map((x: any) => x.genreId ?? x.id ?? x)
      storyForm.value.genreIds = normalizeGenreIdsInput(ids)
    }

    chapterForm.value.truyenId = story.id || 0
    await loadChapters()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể tải truyện để sửa')
  }
}

watch(
  () => route.query.edit,
  async () => {
    await loadStoryForEdit()
  },
  { immediate: true }
)

// Create story
async function createStory(): Promise<void> {
  try {
    const payload = {
      ...storyForm.value,
      genreIds: normalizeGenreIdsInput(storyForm.value.genreIds)
    }
    storyForm.value.genreIds = payload.genreIds
    const newStory = await storiesStore.createStory(payload)
    storiesStore.setCurrentStory(newStory)
    chapterForm.value.truyenId = newStory.id!
    step.value = 2
    showNotice('success', 'Tạo truyện thành công! Bây giờ bạn có thể thêm chương.')

    // Load existing chapters if any
    await loadChapters()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể tạo truyện')
    console.error('Error creating story:', err)
  }
}

async function updateStory(): Promise<void> {
  if (!editId.value) return
  savingStory.value = true
  try {
    const normalizedGenres = normalizeGenreIdsInput(storyForm.value.genreIds)
    const payload = {
      title: storyForm.value.title,
      authorName: storyForm.value.authorName,
      genreIds: normalizedGenres,
      slug: storyForm.value.slug,
      description: storyForm.value.description,
      coverImage: storyForm.value.coverImage,
      publishStatus: storyForm.value.publishStatus
    }
    storyForm.value.genreIds = normalizedGenres

    let updated: any
    try {
      const res: any = await storiesStore.updateStoryDetails(editId.value, payload)
      updated = (res && (res.truyen || res.story)) || res
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 404 || status === 405) {
        updated = await storiesStore.updateStory(editId.value, payload)
      } else {
        throw err
      }
    }

    if (updated) {
      storiesStore.setCurrentStory(updated)
    }

    chapterForm.value.truyenId = editId.value
    await loadChapters()
    step.value = 2
    showNotice('success', 'Cập nhật truyện thành công!')
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể cập nhật truyện')
    console.error('Error updating story:', err)
  } finally {
    savingStory.value = false
  }
}

async function submitStory(): Promise<void> {
  if (isEditMode.value) {
    await updateStory()
  } else {
    await createStory()
  }
}

async function goToChapters(): Promise<void> {
  if (!currentStory.value?.id) {
    showNotice('error', 'Vui lòng chờ tải truyện trước khi thêm chương.')
    return
  }
  chapterForm.value.truyenId = currentStory.value.id
  await loadChapters()
  step.value = 2
}

// Load chapters for current story
async function loadChapters(): Promise<void> {
  if (currentStory.value?.id) {
    try {
      await storiesStore.fetchChapters(currentStory.value.id)
    } catch (err) {
      console.error('Error loading chapters:', err)
    }
  }
}

// Add chapter
async function addChapter(): Promise<void> {
  try {
    await storiesStore.addChapter(chapterForm.value)

    // Reset form for next chapter
    chapterForm.value.chapterNumber++
    chapterForm.value.title = ''
    chapterForm.value.content = ''

    showNotice('success', 'Thêm chương thành công!')
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể thêm chương')
    console.error('Error adding chapter:', err)
  }
}

// Edit chapter
function editChapter(chapter: Chapter): void {
  editingChapter.value = chapter
  showChapterModal.value = true
}

// Save chapter (create or update)
async function saveChapter(chapterData: Chapter & { id?: number }): Promise<void> {
  try {
    if (chapterData.id) {
      // Update existing chapter
      await storiesStore.updateChapter(chapterData.id, chapterData)
      showNotice('success', 'Cập nhật chương thành công!')
    } else {
      // Create new chapter
      await storiesStore.addChapter(chapterData)
      showNotice('success', 'Thêm chương thành công!')
    }
    closeChapterModal()
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể lưu chương')
    console.error('Error saving chapter:', err)
  }
}

// Close chapter modal
function closeChapterModal(): void {
  showChapterModal.value = false
  editingChapter.value = null
}

// Delete chapter
async function deleteChapter(id: number): Promise<void> {
  if (!confirm('Bạn có chắc muốn xóa chương này?')) return

  try {
    await storiesStore.deleteChapter(id)
    showNotice('success', 'Xóa chương thành công!')
  } catch (err) {
    showNotice('error', err instanceof Error ? err.message : 'Không thể xóa chương')
    console.error('Error deleting chapter:', err)
  }
}

// Status helpers
function getStatusClass(status?: string): string {
  switch (status) {
    case 'APPROVED': return 'px-2 py-1 bg-green-100 text-green-800 rounded text-xs'
    case 'REJECTED': return 'px-2 py-1 bg-red-100 text-red-800 rounded text-xs'
    default: return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs'
  }
}

function getStatusText(status?: string): string {
  switch (status) {
    case 'APPROVED': return 'Đã duyệt'
    case 'REJECTED': return 'Từ chối'
    default: return 'Chờ duyệt'
  }
}

function getPublishStatusClass(status?: string): string {
  switch (status) {
    case 'ONGOING': return 'px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'
    case 'COMPLETED': return 'px-2 py-1 bg-green-100 text-green-800 rounded text-xs'
    case 'PAUSED': return 'px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs'
    default: return 'px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs'
  }
}

function getPublishStatusText(status?: string): string {
  switch (status) {
    case 'ONGOING': return 'Đang tiến hành'
    case 'COMPLETED': return 'Hoàn thành'
    case 'PAUSED': return 'Tạm dừng'
    default: return 'Không xác định'
  }
}
</script>
