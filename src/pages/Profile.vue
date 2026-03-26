<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">Trang của bạn</h1>
      <div v-if="!auth.isAuthenticated" class="bg-white p-4 rounded shadow">
        Bạn cần đăng nhập để xem thông tin.
      </div>

      <div v-else class="space-y-6">
        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Thông tin cá nhân</h2>
          <div class="text-sm text-gray-600">Username: {{ auth.user?.username }}</div>
          <div class="text-sm text-gray-600">Email: {{ auth.user?.email || 'Chưa có' }}</div>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Đổi mật khẩu</h2>
          <p class="text-sm text-gray-500 mb-3">Nhấn gửi mã OTP để nhận mã về email đăng ký.</p>
          <form @submit.prevent="confirmChangePassword" class="space-y-3 max-w-md">
            <FormField label="Mật khẩu hiện tại" :error="changeErrors.currentPassword">
              <BaseInput v-model="changeForm.currentPassword" type="password" autocomplete="current-password" />
            </FormField>

            <FormField label="Mã OTP" :error="changeErrors.otp">
              <BaseInput v-model="changeForm.otp" placeholder="Nhập mã 6 số" autocomplete="one-time-code" />
            </FormField>

            <FormField label="Mật khẩu mới" :error="changeErrors.newPassword">
              <BaseInput v-model="changeForm.newPassword" type="password" autocomplete="new-password" />
            </FormField>

            <FormField label="Nhập lại mật khẩu mới" :error="changeErrors.confirmPassword">
              <BaseInput v-model="changeForm.confirmPassword" type="password" autocomplete="new-password" />
            </FormField>

            <p v-if="changeInfo" class="text-sm text-green-600 bg-green-50 p-3 rounded">{{ changeInfo }}</p>
            <p v-if="changeError" class="text-sm text-red-600 bg-red-50 p-3 rounded">{{ changeError }}</p>

            <div class="flex flex-wrap items-center gap-3">
              <BaseButton :disabled="changeSaving" variant="primary" size="md">
                <span v-if="!changeSaving">Cập nhật mật khẩu</span>
                <span v-else>Đang cập nhật...</span>
              </BaseButton>
              <BaseButton
                variant="secondary"
                size="md"
                type="button"
                :disabled="changeSending || changeCooldown > 0"
                @click="sendChangeOtp"
              >
                <span v-if="changeCooldown === 0">Gửi mã OTP</span>
                <span v-else>Gửi lại sau {{ changeCooldown }}s</span>
              </BaseButton>
            </div>
          </form>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Truyện yêu thích</h2>
          <div v-if="favorites.length === 0" class="text-sm text-gray-500">Chưa có truyện nào.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="f in favorites" :key="f.truyenId">Truyện ID: {{ f.truyenId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Đang theo dõi</h2>
          <div v-if="following.length === 0" class="text-sm text-gray-500">Chưa theo dõi ai.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="f in following" :key="f.followingId">User ID: {{ f.followingId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Lịch sử đọc</h2>
          <div v-if="history.length === 0" class="text-sm text-gray-500">Chưa có lịch sử.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="h in history" :key="h.chapterId">Chương ID: {{ h.chapterId }}</li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded shadow">
          <h2 class="font-semibold mb-2">Thể loại yêu thích</h2>
          <div v-if="userGenres.length === 0" class="text-sm text-gray-500">Chưa chọn thể loại.</div>
          <ul v-else class="space-y-2 text-sm">
            <li v-for="g in userGenres" :key="g.genreId">{{ genreName(g.genreId) }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useGenreStore } from '../stores'
import { BaseInput, BaseButton, FormField } from '../components'
import favoritesService from '../services/favorites'
import followsService from '../services/follows'
import readingHistoryService from '../services/readingHistory'
import userGenresService from '../services/userGenres'
import passwordChangeService from '../services/passwordChange'

const auth = useAuthStore()
const genreStore = useGenreStore()
const router = useRouter()

const favorites = ref([])
const following = ref([])
const history = ref([])
const userGenres = ref([])

const changeSending = ref(false)
const changeSaving = ref(false)
const changeInfo = ref(null)
const changeError = ref(null)
const changeCooldown = ref(0)
const changeForm = reactive({
  currentPassword: '',
  otp: '',
  newPassword: '',
  confirmPassword: ''
})
const changeErrors = reactive({
  currentPassword: null,
  otp: null,
  newPassword: null,
  confirmPassword: null
})
let changeTimer = null

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

function genreName(id) {
  return genreStore.genres.find(g => g.id === id)?.name || `Genre ${id}`
}

function clearChangeMessages() {
  changeInfo.value = null
  changeError.value = null
}

function validateChangeForm() {
  changeErrors.currentPassword = changeForm.currentPassword ? null : 'Vui lòng nhập mật khẩu hiện tại'
  changeErrors.otp = changeForm.otp ? null : 'Vui lòng nhập mã OTP'
  changeErrors.newPassword = changeForm.newPassword ? null : 'Vui lòng nhập mật khẩu mới'
  changeErrors.confirmPassword = changeForm.confirmPassword ? null : 'Vui lòng nhập lại mật khẩu mới'

  if (changeForm.newPassword && changeForm.newPassword.length < 6) {
    changeErrors.newPassword = 'Mật khẩu tối thiểu 6 ký tự'
  }

  if (changeForm.newPassword && changeForm.confirmPassword && changeForm.newPassword !== changeForm.confirmPassword) {
    changeErrors.confirmPassword = 'Mật khẩu nhập lại không khớp'
  }

  return !changeErrors.currentPassword && !changeErrors.otp && !changeErrors.newPassword && !changeErrors.confirmPassword
}

function startChangeCooldown(seconds = 60) {
  changeCooldown.value = seconds
  if (changeTimer) clearInterval(changeTimer)
  changeTimer = setInterval(() => {
    changeCooldown.value -= 1
    if (changeCooldown.value <= 0) {
      clearInterval(changeTimer)
      changeTimer = null
    }
  }, 1000)
}

async function sendChangeOtp() {
  clearChangeMessages()
  changeSending.value = true
  try {
    await passwordChangeService.requestChangeOtp()
    changeInfo.value = 'Đã gửi mã OTP về email đăng ký.'
    startChangeCooldown(60)
  } catch (e) {
    changeError.value = e?.message || 'Gửi mã OTP thất bại'
  } finally {
    changeSending.value = false
  }
}

async function confirmChangePassword() {
  clearChangeMessages()
  changeErrors.currentPassword = null
  changeErrors.otp = null
  changeErrors.newPassword = null
  changeErrors.confirmPassword = null
  if (!validateChangeForm()) return

  changeSaving.value = true
  try {
    await passwordChangeService.confirmChangePassword({
      currentPassword: String(changeForm.currentPassword || ''),
      otp: String(changeForm.otp || ''),
      newPassword: String(changeForm.newPassword || '')
    })
    changeInfo.value = 'Đổi mật khẩu thành công.'
    changeForm.currentPassword = ''
    changeForm.otp = ''
    changeForm.newPassword = ''
    changeForm.confirmPassword = ''
  } catch (e) {
    changeError.value = e?.message || 'Đổi mật khẩu thất bại'
  } finally {
    changeSaving.value = false
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    router.push({ name: 'Login', query: { redirect: '/me' } })
    return
  }

  await auth.fetchMe()
  await genreStore.fetchGenres()
  favorites.value = normalizePaged(await favoritesService.getMine({ page: 0, size: 50 }))
  following.value = normalizePaged(await followsService.getFollowing({ page: 0, size: 50 }))
  history.value = normalizePaged(await readingHistoryService.getMine({ page: 0, size: 50 }))
  userGenres.value = normalizePaged(await userGenresService.getMine())
})

onUnmounted(() => {
  if (changeTimer) clearInterval(changeTimer)
})
</script>

