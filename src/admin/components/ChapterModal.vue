<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
        <h2 class="text-xl font-bold">{{ chapter?.id ? 'Chỉnh sửa chương' : 'Thêm chương mới' }}</h2>
        <button
          @click="handleCancel"
          class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <!-- Chapter Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Số chương <span class="text-red-600">*</span>
          </label>
          <input
            v-model.number="form.chapterNumber"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <p v-if="errors.chapterNumber" class="text-red-600 text-xs mt-1">{{ errors.chapterNumber }}</p>
        </div>

        <!-- Chapter Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề chương <span class="text-red-600">*</span>
          </label>
          <input
            v-model.trim="form.title"
            type="text"
            placeholder="VD: Chương 1: Bắt đầu hành trình"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <p v-if="errors.title" class="text-red-600 text-xs mt-1">{{ errors.title }}</p>
        </div>

        <!-- Chapter Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nội dung chương <span class="text-red-600">*</span>
          </label>
          <textarea
            v-model="form.content"
            rows="12"
            placeholder="Nhập nội dung chương..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          ></textarea>
          <p v-if="errors.content" class="text-red-600 text-xs mt-1">{{ errors.content }}</p>
        </div>

        <!-- Error message -->
        <div v-if="errors.submit" class="bg-red-50 border border-red-200 rounded p-3">
          <p class="text-sm text-red-700">{{ errors.submit }}</p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            @click="handleCancel"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu chương' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Chapter } from '@/stores'

interface FormData extends Omit<Chapter, 'id'> {
  id?: number
}

interface FormErrors {
  chapterNumber: string
  title: string
  content: string
  submit: string
}

const props = defineProps<{
  chapter: Chapter | null
  storyId: number
  defaultChapterNumber?: number
}>()

const emit = defineEmits<{
  save: [chapter: FormData]
  cancel: []
}>()

const form = ref<FormData>({
  id: undefined,
  truyenId: props.storyId,
  chapterNumber: 1,
  title: '',
  content: ''
})

const errors = ref<FormErrors>({
  chapterNumber: '',
  title: '',
  content: '',
  submit: ''
})

const isSubmitting = ref(false)

// Watch chapter prop to update form when it changes
watch(
  () => props.chapter,
  (newChapter) => {
    if (newChapter) {
      form.value = {
        id: newChapter.id,
        truyenId: newChapter.truyenId,
        chapterNumber: newChapter.chapterNumber,
        title: newChapter.title,
        content: newChapter.content
      }
    } else {
      // Reset form for new chapter
      form.value = {
        id: undefined,
        truyenId: props.storyId,
        chapterNumber: props.defaultChapterNumber || 1,
        title: '',
        content: ''
      }
    }
  },
  { immediate: true, deep: true }
)

// Watch storyId to update truyenId
watch(
  () => props.storyId,
  (newStoryId) => {
    form.value.truyenId = newStoryId
  }
)

watch(
  () => props.defaultChapterNumber,
  (newNumber) => {
    if (!props.chapter && newNumber) {
      form.value.chapterNumber = newNumber
    }
  }
)

// Validate form
function validate(): boolean {
  errors.value = { chapterNumber: '', title: '', content: '', submit: '' }

  if (!form.value.chapterNumber || form.value.chapterNumber < 1) {
    errors.value.chapterNumber = 'Số chương phải là số dương'
  }

  if (!form.value.title.trim()) {
    errors.value.title = 'Tiêu đề chương không được để trống'
  } else if (form.value.title.length > 200) {
    errors.value.title = 'Tiêu đề không được vượt quá 200 ký tự'
  }

  if (!form.value.content.trim()) {
    errors.value.content = 'Nội dung chương không được để trống'
  }

  return !errors.value.chapterNumber && !errors.value.title && !errors.value.content
}

// Handle save
async function handleSave(): Promise<void> {
  if (!validate()) return

  isSubmitting.value = true
  try {
    emit('save', form.value)
  } catch (err) {
    errors.value.submit = err instanceof Error ? err.message : 'Lỗi khi lưu chương'
  } finally {
    isSubmitting.value = false
  }
}

// Handle cancel
function handleCancel(): void {
  emit('cancel')
}
</script>
