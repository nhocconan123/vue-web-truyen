<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
    <div class="w-full max-w-xl mx-4 bg-white p-8 rounded-xl shadow-md">
      <div class="mb-6 text-center">
        <img src="/logo.svg" alt="Logo" class="mx-auto w-20 h-20 mb-2" />
        <h2 class="text-2xl font-semibold">Đăng ký</h2>
        <p class="text-sm text-gray-500">Tạo tài khoản để bắt đầu đọc truyện</p>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <FormField label="Tên đăng nhập" :error="errors.username">
          <BaseInput v-model="form.username" placeholder="username" autocomplete="username" />
        </FormField>

        <FormField label="Email" :error="errors.email">
          <BaseInput v-model="form.email" placeholder="email@example.com" type="email" autocomplete="email" />
        </FormField>

        <FormField label="Mật khẩu" :error="errors.password">
          <BaseInput v-model="form.password" type="password" placeholder="••••••" autocomplete="new-password" />
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
      errors.username = form.username ? null : 'Vui lòng nhập tên đăng nhập'
      errors.email = form.email ? null : 'Vui lòng nhập email'
      errors.password = form.password ? null : 'Vui lòng nhập mật khẩu'
      return !errors.username && !errors.email && !errors.password
    }

    const submit = async () => {
      error.value = null
      if (!validate()) return
      loading.value = true
      try {
        await authStore.register({
          username: form.username,
          email: form.email,
          password: form.password,
          avatar: form.avatar || undefined,
          bio: form.bio || undefined
        })
        router.push('/')
      } catch (e) {
        error.value = e.response?.data?.message || e.message || 'Đăng ký thất bại'
      } finally {
        loading.value = false
      }
    }

    return { form, errors, loading, error, submit }
  }
}
</script>

