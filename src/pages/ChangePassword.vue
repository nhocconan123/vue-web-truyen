<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="bg-white p-6 rounded-xl shadow">
        <div class="mb-5">
          <h1 class="text-2xl font-bold">Đổi mật khẩu</h1>
          <p class="text-sm text-gray-500 mt-1">
            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật tài khoản.
          </p>
        </div>

        <form @submit.prevent="submitChange" class="space-y-4">
          <FormField label="Mật khẩu hiện tại" :error="errors.currentPassword">
            <BaseInput
              v-model="form.currentPassword"
              type="password"
              autocomplete="current-password"
              placeholder="Nhập mật khẩu hiện tại"
            />
          </FormField>

          <FormField label="Mật khẩu mới" :error="errors.newPassword">
            <BaseInput
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Ít nhất 6 ký tự"
            />
          </FormField>

          <FormField label="Nhập lại mật khẩu mới" :error="errors.confirmPassword">
            <BaseInput
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="Nhập lại mật khẩu mới"
            />
          </FormField>

          <p v-if="successMessage" class="text-sm text-green-700 bg-green-50 p-3 rounded">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 p-3 rounded">
            {{ errorMessage }}
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <BaseButton :disabled="submitting" variant="primary" size="md">
              <span v-if="!submitting">Cập nhật mật khẩu</span>
              <span v-else>Đang cập nhật...</span>
            </BaseButton>

            <button
              type="button"
              class="px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              @click="goBack"
            >
              Quay lại
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseInput, FormField } from '../components'
import passwordChangeService from '../services/passwordChange'

const router = useRouter()
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
let redirectTimer = null

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const errors = reactive({
  currentPassword: null,
  newPassword: null,
  confirmPassword: null
})

function resetMessages() {
  successMessage.value = ''
  errorMessage.value = ''
}

function validateForm() {
  errors.currentPassword = form.currentPassword ? null : 'Vui lòng nhập mật khẩu hiện tại'
  errors.newPassword = form.newPassword ? null : 'Vui lòng nhập mật khẩu mới'
  errors.confirmPassword = form.confirmPassword ? null : 'Vui lòng nhập lại mật khẩu mới'

  if (form.newPassword && form.newPassword.length < 6) {
    errors.newPassword = 'Mật khẩu tối thiểu 6 ký tự'
  }
  if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại'
  }
  if (form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu nhập lại không khớp'
  }

  return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
}

async function submitChange() {
  resetMessages()
  if (!validateForm()) return

  submitting.value = true
  try {
    await passwordChangeService.changePassword({
      currentPassword: String(form.currentPassword || ''),
      newPassword: String(form.newPassword || '')
    })
    successMessage.value = 'Đổi mật khẩu thành công. Đang quay về trang chủ...'
    form.currentPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''
    redirectTimer = setTimeout(() => {
      router.push({ name: 'Home' })
    }, 800)
  } catch (e) {
    errorMessage.value = e?.message || 'Đổi mật khẩu thất bại'
  } finally {
    submitting.value = false
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push({ name: 'Home' })
}

onUnmounted(() => {
  if (redirectTimer) {
    clearTimeout(redirectTimer)
    redirectTimer = null
  }
})
</script>
