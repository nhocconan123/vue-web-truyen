<template>
  <div class="max-w-2xl mx-auto p-6">
    <h2 class="text-xl font-semibold mb-4">Thêm truyện mới</h2>
    <form @submit.prevent="submit">
      <FormField label="Tiêu đề">
        <BaseInput v-model="title" placeholder="Nhập tiêu đề" />
      </FormField>

      <FormField label="Tác giả">
        <BaseInput v-model="author" placeholder="Tên tác giả" />
      </FormField>

      <FormField label="Tóm tắt">
        <BaseTextarea v-model="summary" rows="6" placeholder="Tóm tắt ngắn" />
      </FormField>

      <FormField label="Thể loại (phân cách bằng ,)">
        <BaseInput v-model="genres" placeholder="ví dụ: Hành động, Tình cảm" />
      </FormField>

      <div class="flex items-center gap-2">
        <BaseButton :disabled="loading">{{ loading ? 'Đang...' : 'Tạo truyện' }}</BaseButton>
        <router-link to="/admin"><button type="button" class="text-gray-600">Hủy</button></router-link>
      </div>
    </form>
    <p v-if="message" class="mt-4 text-green-600">{{ message }}</p>
    <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from '../../services/axios'
import { BaseInput, BaseTextarea, FormField, BaseButton } from '../../components'

export default {
  name: 'AdminNewStory',
  components: { BaseInput, BaseTextarea, FormField, BaseButton },
  setup() {
    const title = ref('')
    const author = ref('')
    const summary = ref('')
    const genres = ref('')
    const loading = ref(false)
    const message = ref('')
    const error = ref('')

    const submit = async () => {
      loading.value = true
      message.value = ''
      error.value = ''
      try {
        const payload = {
          title: title.value,
          author: author.value,
          summary: summary.value,
          genres: genres.value.split(',').map(g => g.trim()).filter(Boolean)
        }
        // use full backend URL to ensure correct target
        const res = await api.post('http://127.0.0.1:8081/api/stories', payload)
        message.value = 'Tạo truyện thành công'
        // optionally clear form
        title.value = ''
        author.value = ''
        summary.value = ''
        genres.value = ''
      } catch (e) {
        error.value = e.response?.data?.message || e.message || 'Lỗi khi tạo truyện'
      } finally {
        loading.value = false
      }
    }

    return { title, author, summary, genres, loading, message, error, submit }
  }
}
</script>
