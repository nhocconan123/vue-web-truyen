<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
    <div class="w-full max-w-4xl mx-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div class="hidden lg:flex items-center justify-center">
        <div class="w-96 p-8 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <h1 class="text-3xl font-bold mb-2">Welcome Back</h1>
          <p class="opacity-90">Quản lý và tạo truyện mới nhanh chóng. Đăng nhập để tiếp tục.</p>
        </div>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-md">
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-semibold">Đăng nhập</h2>
          <p class="text-sm text-gray-500">Đăng nhập bằng tài khoản quản trị hoặc user</p>
        </div>

        <form @submit.prevent="submit" class="space-y-4">
          <FormField label="Tên đăng nhập" :error="errors.username">
            <BaseInput v-model="username" placeholder="admin01" autocomplete="username" autofocus />
          </FormField>

          <FormField label="Mật khẩu" :error="errors.password">
            <BaseInput v-model="password" type="password" placeholder="••••••" autocomplete="current-password" />
          </FormField>

          <div class="flex items-center justify-between">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="remember" class="form-checkbox h-4 w-4 text-blue-600" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <router-link to="/forgot" class="text-sm text-blue-600 hover:underline">Quên mật khẩu?</router-link>
          </div>

          <p v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded">{{ error }}</p>

          <div class="flex items-center gap-3">
            <BaseButton :disabled="loading" class="flex-1">
              <span v-if="!loading">Đăng nhập</span>
              <span v-else>Đang đăng nhập...</span>
            </BaseButton>
            <!-- <button type="button" @click="fillDemo" class="px-4 py-2 border rounded hover:bg-gray-50">
              Demo
            </button> -->
          </div>

          <div class="pt-4 text-center text-sm text-gray-500">
            Chưa có tài khoản? <router-link to="/register" class="text-blue-600 hover:underline">Đăng ký</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores'
import { BaseInput, BaseButton, FormField } from '../components'

export default {
  name: 'LoginPage',
  components: { BaseInput, BaseButton, FormField },
  setup () {
    const router = useRouter()
    const authStore = useAuthStore()
    const username = ref('')
    const password = ref('')
    const remember = ref(false)
    const error = ref(null)
    const loading = ref(false)
    const errors = reactive({ username: null, password: null })

    const validate = () => {
      errors.username = username.value ? null : 'Vui lòng nhập tên đăng nhập'
      errors.password = password.value ? null : 'Vui lòng nhập mật khẩu'
      return !errors.username && !errors.password
    }

    const submit = async () => {
      error.value = null
      if (!validate()) return
      
      loading.value = true
      try {
        // Đăng nhập thành công
        const data = await authStore.login({ username: username.value, password: password.value })
        
        // sau khi đăng nhập thành công luôn chuyển đến trang admin
        router.push('/admin')
      } catch (e) {
        // Hiển thị thông báo lỗi khi đăng nhập thất bại
        error.value = e.response?.data?.message || e.message || 'Đăng nhập thất bại'
      } finally {
        loading.value = false
      }
    }

    const fillDemo = () => {
      username.value = 'admin01'
      password.value = '123456'
    }

    return { username, password, remember, error, loading, errors, submit, fillDemo }
  }
}
</script>
