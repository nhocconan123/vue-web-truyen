<template>
  <div class="min-h-screen flex items-center justify-center login-page">
    <div class="w-full max-w-xl mx-4 login-card p-8 rounded-xl shadow-md">
      <div class="mb-6 text-center">
        <img src="/logo.svg" alt="Logo" class="mx-auto w-20 h-20 mb-2" />
        <h2 class="text-2xl font-semibold">Đăng ký</h2>
        <p class="text-sm text-gray-500">Tạo tài khoản để bắt đầu đọc truyện</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <FormField label="Tên đăng nhập" :error="errors.username">
          <BaseInput v-model="form.username" placeholder="user1" autocomplete="username" />
        </FormField>

        <FormField label="Email" :error="errors.email">
          <BaseInput v-model="form.email" placeholder="user1@example.com" type="email" autocomplete="email" />
        </FormField>

        <FormField label="Mật khẩu" :error="errors.password">
          <BaseInput v-model="form.password" type="password" placeholder="123456" autocomplete="new-password" />
        </FormField>

        <FormField label="Avatar URL">
          <BaseInput v-model="form.avatar" placeholder="https://..." type="url" />
        </FormField>

        <FormField label="Giới thiệu">
          <BaseTextarea v-model="form.bio" rows="3" placeholder="Vài dòng giới thiệu..." />
        </FormField>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex items-center gap-3">
          <BaseButton :disabled="loading" variant="primary" size="md">
            <span v-if="!loading">Đăng ký</span>
            <span v-else>Đang đăng ký...</span>
          </BaseButton>
          <router-link to="/login" class="text-sm text-blue-600 hover:underline">Đã có tài khoản?</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores'
import { BaseInput, BaseButton, BaseTextarea, FormField } from '../components'

export default {
  name: 'RegisterPage',
  components: { BaseInput, BaseButton, BaseTextarea, FormField },
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const loading = ref(false)
    const error = ref(null)
    const form = reactive({
      username: '',
      email: '',
      password: '',
      avatar: '',
      bio: ''
    })
    const errors = reactive({ username: null, email: null, password: null })

    const validate = () => {
      const username = String(form.username || '').trim()
      const email = String(form.email || '').trim()
      const password = String(form.password || '').trim()

      errors.username = username ? null : 'Vui lòng nhập tên đăng nhập'
      errors.email = email ? null : 'Vui lòng nhập email'
      errors.password = password ? null : 'Vui lòng nhập mật khẩu'

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Email không hợp lệ'
      }

      return !errors.username && !errors.email && !errors.password
    }

    const submit = async () => {
      error.value = null
      errors.username = null
      errors.email = null
      errors.password = null
      if (!validate()) return
      loading.value = true
      try {
        await authStore.register({
          username: String(form.username || '').trim(),
          email: String(form.email || '').trim(),
          password: String(form.password || '').trim(),
          avatar: form.avatar || '',
          bio: form.bio || ''
        })
        router.push('/')
      } catch (e) {
        const message = e.response?.data?.message || e.message || 'Đăng ký thất bại'
        const lower = String(message || '').toLowerCase()
        const payload = e.response?.data

        if (payload?.errors && typeof payload.errors === 'object') {
          errors.username = payload.errors.username || errors.username
          errors.email = payload.errors.email || errors.email
          errors.password = payload.errors.password || errors.password
        }

        if (lower.includes('username')) {
          errors.username = 'Tên đăng nhập đã tồn tại'
        }
        if (lower.includes('email')) {
          errors.email = 'Email đã tồn tại'
        }

        if (!errors.username && !errors.email && !errors.password) {
          error.value = message
        }
      } finally {
        loading.value = false
      }
    }

    return { form, errors, loading, error, submit }
  }
}
</script>

