<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
        <h2 class="text-xl font-bold">{{ genre?.id ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới' }}</h2>
        <button
          @click="handleCancel"
          class="text-gray-500 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <form @submit.prevent="handleSave" class="p-6 space-y-4">
        <!-- Name field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tên thể loại <span class="text-red-600">*</span>
          </label>
          <input
            v-model.trim="form.name"
            @input="autoGenerateSlug"
            type="text"
            placeholder="VD: Tiên Hiệp, Ngôn Tình..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <p v-if="errors.name" class="text-red-600 text-xs mt-1">{{ errors.name }}</p>
        </div>

        <!-- Slug field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Slug <span class="text-red-600">*</span>
          </label>
          <input
            v-model.trim="form.slug"
            type="text"
            placeholder="VD: tien-hiep, ngon-tinh..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
          <p class="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
          <p v-if="errors.slug" class="text-red-600 text-xs mt-1">{{ errors.slug }}</p>
        </div>

        <!-- Description field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mô tả
          </label>
          <textarea
            v-model="form.description"
            placeholder="Nhập mô tả thể loại (tuỳ chọn)..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          ></textarea>
        </div>

        <!-- Status field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
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
            {{ isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Genre } from '@/stores'

interface FormData extends Genre {
  id: number | null
}

interface FormErrors {
  name: string
  slug: string
  submit: string
}

const props = defineProps<{
  genre: Genre | null
}>()

const emit = defineEmits<{
  save: [genre: FormData]
  cancel: []
}>()

const form = ref<FormData>({
  id: null,
  name: '',
  slug: '',
  description: '',
  status: 'ACTIVE'
})

const errors = ref<FormErrors>({
  name: '',
  slug: '',
  submit: ''
})

const isSubmitting = ref(false)

// Watch genre prop to update form when it changes
watch(
  () => props.genre,
  (newGenre) => {
    if (newGenre) {
      form.value = {
        id: newGenre.id || null,
        name: newGenre.name || '',
        slug: newGenre.slug || '',
        description: newGenre.description || '',
        status: newGenre.status || 'ACTIVE'
      }
    }
  },

  
  { immediate: true, deep: true }
)

// Auto-generate slug from name
function autoGenerateSlug(): void {
  if (!form.value.id) { // Only auto-generate for new genres
    form.value.slug = form.value.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
}

// Validate form
function validate(): boolean {
  errors.value = { name: '', slug: '', submit: '' }

  if (!form.value.name.trim()) {
    errors.value.name = 'Tên thể loại không được để trống'
  } else if (form.value.name.length > 100) {
    errors.value.name = 'Tên không được vượt quá 100 ký tự'
  }

  if (!form.value.slug.trim()) {
    errors.value.slug = 'Slug không được để trống'
  } else if (!/^[a-z0-9-]+$/.test(form.value.slug)) {
    errors.value.slug = 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang'
  } else if (form.value.slug.length > 100) {
    errors.value.slug = 'Slug không được vượt quá 100 ký tự'
  }

  return !errors.value.name && !errors.value.slug
}

// Handle save
async function handleSave(): Promise<void> {
  if (!validate()) return

  isSubmitting.value = true
  try {
    emit('save', form.value)
  } catch (err) {
    errors.value.submit = err instanceof Error ? err.message : 'Lỗi khi lưu'
  } finally {
    isSubmitting.value = false
  }
}

// Handle cancel
function handleCancel(): void {
  emit('cancel')
}
</script>
