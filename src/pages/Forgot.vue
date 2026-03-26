<template>
  <div class="min-h-screen flex items-center justify-center login-page">
    <div class="w-full max-w-xl mx-4 login-card p-8 rounded-xl shadow-md">
      <div class="mb-6 text-center">
        <img src="/logo.svg" alt="Logo" class="mx-auto w-20 h-20 mb-2" />
        <h2 class="text-2xl font-semibold">Quen mat khau</h2>
        <p class="text-sm text-gray-500">
          Nhap email da dang ky. Neu hop le, he thong se dat lai mat khau mac dinh
          va gui mat khau moi qua email.
        </p>
      </div>

      <form v-if="!success" @submit.prevent="submit" class="space-y-4">
        <FormField label="Email dang ky" :error="errors.email">
          <BaseInput
            v-model="form.email"
            type="email"
            placeholder="user@gmail.com"
            autocomplete="email"
          />
        </FormField>

        <p v-if="info" class="text-sm text-green-600 bg-green-50 p-3 rounded">{{ info }}</p>
        <p v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded">{{ error }}</p>

        <div class="flex items-center gap-3">
          <BaseButton :disabled="sending" variant="primary" size="md">
            <span v-if="!sending">Dat lai mat khau</span>
            <span v-else>Dang xu ly...</span>
          </BaseButton>
          <router-link to="/login" class="text-sm text-blue-600 hover:underline">
            Quay lai dang nhap
          </router-link>
        </div>
      </form>

      <div v-else class="space-y-4 text-center">
        <p class="text-green-700 bg-green-50 p-3 rounded">
          Yeu cau da duoc xu ly. Vui long kiem tra email de nhan mat khau moi.
        </p>
        <router-link to="/login" class="text-sm text-blue-600 hover:underline">
          Di den trang dang nhap
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { BaseInput, BaseButton, FormField } from '../components'
import passwordResetService from '../services/passwordReset'

const success = ref(false)
const sending = ref(false)
const info = ref('')
const error = ref('')

const form = reactive({
  email: ''
})

const errors = reactive({
  email: null
})

function clearMessages() {
  info.value = ''
  error.value = ''
}

function validateEmail() {
  const email = String(form.email || '').trim()
  errors.email = email ? null : 'Vui long nhap email'
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email khong hop le'
  }
  return !errors.email
}

async function submit() {
  clearMessages()
  if (!validateEmail()) return

  sending.value = true
  try {
    await passwordResetService.requestPasswordReset(String(form.email || '').trim())
    info.value = 'Neu email ton tai, mat khau moi da duoc gui qua email.'
    success.value = true
  } catch (e) {
    error.value = e?.message || 'Khong the dat lai mat khau'
  } finally {
    sending.value = false
  }
}
</script>
