<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <div class="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <main class="lg:col-span-2 space-y-6">
        <div v-if="loading" class="bg-white p-4 rounded shadow text-sm text-gray-500">Đang tải truyện...</div>
        <div v-else-if="error" class="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
          {{ error }}
        </div>

        <div v-if="story" class="bg-white rounded-lg shadow overflow-hidden">
          <div class="relative">
            <img :src="storyCover" alt="cover" class="w-full h-56 object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div class="p-6 text-white">
                <h1 class="text-2xl font-bold">{{ story.title }}</h1>
                <p class="text-sm mt-1">Tác giả: {{ storyAuthor }}</p>
                <p class="text-xs mt-1">Thể loại: {{ genreText }}</p>
                <p v-if="publishStatusText" class="text-xs mt-1">Trạng thái: {{ publishStatusText }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <router-link v-if="firstChapter" :to="readerLink(firstChapter)" class="px-4 py-2 bg-blue-500 rounded">
                    Đọc từ đầu
                  </router-link>
                  <router-link v-if="latestChapter" :to="readerLink(latestChapter)" class="px-4 py-2 bg-white text-gray-800 rounded">
                    Đọc chương mới nhất
                  </router-link>
                  <button @click="toggleFavorite" class="px-4 py-2 border border-white rounded">
                    {{ isFavorite ? 'Đã yêu thích' : 'Yêu thích' }}
                  </button>
                  <button v-if="story.authorId" @click="toggleFollow" class="px-4 py-2 border border-white rounded">
                    {{ isFollowing ? 'Đang theo dõi' : 'Theo dõi tác giả' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <p class="text-gray-700">{{ story.description || 'Chưa có mô tả.' }}</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600">
              <div>Lượt xem: <strong>{{ stats.views ?? 0 }}</strong></div>
              <div>Chương: <strong>{{ stats.chapters ?? chapters.length }}</strong></div>
              <div>Bình luận: <strong>{{ stats.comments ?? 0 }}</strong></div>
              <div>Yêu thích: <strong>{{ stats.favorites ?? 0 }}</strong></div>
            </div>
            <div class="text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span>Đánh giá trung bình:</span>
                <div class="flex items-center gap-1">
                  <span
                    v-for="n in 5"
                    :key="`avg-${n}`"
                    :class="n <= averageStars ? 'text-yellow-400' : 'text-gray-300'"
                    class="text-base"
                  >
                    ★
                  </span>
                </div>
                <span v-if="hasAverageRating" class="text-xs text-gray-500">({{ averageRatingDisplay }})</span>
              </div>
              <div class="mt-2 flex items-center gap-2">
                <span>Đánh giá:</span>
                <div class="flex items-center gap-1">
                  <button
                    v-for="n in 5"
                    :key="`rate-${n}`"
                    @click="rate(n)"
                    @mouseenter="hoverRating = n"
                    @mouseleave="hoverRating = 0"
                    class="bg-transparent p-1"
                    type="button"
                    :aria-label="`Đánh giá ${n} sao`"
                  >
                    <span :class="n <= activeRating ? 'text-yellow-400' : 'text-gray-300'" class="text-lg">
                      ★
                    </span>
                  </button>
                </div>
              </div>
              <p v-if="ratingError" class="text-xs text-red-600 mt-1">{{ ratingError }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold">Danh Sách Chương</h3>
            <div class="text-sm text-gray-500">Tổng: {{ chapters.length }}</div>
          </div>
          <div v-if="chapters.length === 0" class="text-sm text-gray-500">Chưa có chương.</div>
          <ul v-else class="space-y-2">
            <li v-for="c in chapters" :key="c.id" class="flex items-center justify-between p-2 border rounded">
              <router-link :to="readerLink(c)" class="text-sm hover:text-blue-600">
                Chương {{ c.chapterNumber }}: {{ c.title }}
              </router-link>
              <div class="text-xs text-gray-500">{{ c.createdAt ? formatTime(c.createdAt) : '' }}</div>
            </li>
          </ul>
        </div>

        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-semibold mb-3">Bình luận ({{ comments.length }})</h3>
          <div v-if="comments.length === 0" class="text-sm text-gray-500">Chưa có bình luận.</div>
          <div v-else class="space-y-3">
            <div v-for="c in comments" :key="c.id" class="flex gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img v-if="c.avatar" :src="c.avatar" alt="" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1">
                <div class="text-sm font-medium">{{ c.username || 'Người dùng' }}</div>
                <div class="text-sm text-gray-700">{{ c.content }}</div>
                <div class="text-xs text-gray-400 mt-1">{{ formatTime(c.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 border-t pt-4">
            <textarea
              v-model="newComment"
              rows="3"
              class="w-full p-2 border rounded"
              placeholder="Viết bình luận..."
            ></textarea>
            <div class="mt-2 text-right">
              <button @click="postComment" class="px-4 py-1 bg-blue-600 text-white rounded">Gửi</button>
            </div>
            <p v-if="commentError" class="text-xs text-red-600 mt-1">{{ commentError }}</p>
          </div>
        </div>
      </main>

      <aside class="space-y-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h4 class="font-semibold mb-3">Gợi ý cho bạn</h4>
          <ul class="space-y-3">
            <li v-for="s in recommendations" :key="s.id || s.slug" class="flex items-center gap-3">
              <img :src="storyCoverOf(s)" class="w-12 h-14 object-cover rounded" />
              <div class="text-sm">
                <router-link :to="storyLink(s)" class="font-medium hover:text-blue-600">{{ s.title }}</router-link>
                <div class="text-xs text-gray-500">{{ s.author || 'Ẩn danh' }}</div>
              </div>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStoriesStore, useGenreStore, useAuthStore } from '../stores'
import favoritesService from '../services/favorites'
import followsService from '../services/follows'
import ratingsService from '../services/ratings'
import truyenGenresService from '../services/truyenGenres'
import commentsService from '../services/comments'

const route = useRoute()
const router = useRouter()
const storiesStore = useStoriesStore()
const genresStore = useGenreStore()
const authStore = useAuthStore()

const story = ref(null)
const stats = ref({})
const genreNames = ref([])
const ratingSummary = ref({ myRating: null, averageRounded: 0, count: 0 })
const selectedRating = ref(0)
const hoverRating = ref(0)
const comments = ref([])
const newComment = ref('')
const commentError = ref('')
const isFavorite = ref(false)
const isFollowing = ref(false)
const ratingError = ref('')
const loading = ref(false)
const error = ref('')

const chapters = computed(() => storiesStore.chapters)
const recommendations = computed(() => storiesStore.stories.slice(0, 4))

const storyAuthor = computed(() => story.value?.author || story.value?.authorName || 'Ẩn danh')
const storyCover = computed(() => story.value?.coverImage || 'https://picsum.photos/seed/story/800/400')
const genreText = computed(() => genreNames.value.length ? genreNames.value.join(', ') : 'Chưa phân loại')
const averageRatingDisplay = computed(() => Number(ratingSummary.value?.averageRounded || 0))
const hasAverageRating = computed(() => averageRatingDisplay.value > 0)
const averageStars = computed(() => averageRatingDisplay.value)
const activeRating = computed(() => hoverRating.value || selectedRating.value)
const publishStatusText = computed(() => {
  const status = story.value?.publishStatus
  if (status === 'ONGOING') return 'Đang cập nhật'
  return ''
})

const firstChapter = computed(() => {
  const list = [...chapters.value]
  if (!list.length) return null
  list.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0))
  return list[0]
})
const latestChapter = computed(() => {
  const list = [...chapters.value]
  if (!list.length) return null
  list.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0))
  return list[list.length - 1]
})

function storyLink(s) {
  const slugOrId = s.slug || s.id
  return { name: 'StoryDetail', params: { id: slugOrId } }
}

function storyCoverOf(s) {
  return s.coverImage || 'https://picsum.photos/seed/story/200/260'
}

function readerLink(chapter) {
  if (!chapter) return { name: 'ReaderLegacy', params: { id: story.value?.id, chapter: undefined } }
  if (story.value?.slug && chapter.chapterNumber != null) {
    return {
      name: 'Reader',
      params: {
        storySlug: story.value.slug,
        chapterSlug: String(chapter.chapterNumber)
      }
    }
  }
  return { name: 'ReaderLegacy', params: { id: story.value?.id, chapter: chapter.id } }
}

function formatTime(value) {
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return value
  }
}

function normalizePaged(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.content || payload?.data || payload?.items || payload?.results || []
}

async function loadGenres() {
  if (!genresStore.genres.length) {
    await genresStore.fetchGenres()
  }
}

async function loadStory() {
  loading.value = true
  error.value = ''
  try {
    const rawId = route.params.id
    const isNumeric = !isNaN(Number(rawId))
    story.value = isNumeric
      ? await storiesStore.fetchStoryById(Number(rawId))
      : await storiesStore.fetchStoryBySlug(String(rawId))

    if (!story.value?.id) return

    if (!storiesStore.stories.length) {
      await storiesStore.fetchStories({ page: 0, size: 4 })
    }

    await storiesStore.fetchChapters(story.value.id)
    stats.value = await storiesStore.fetchStoryStats(story.value.id)
    await loadComments()
    await loadRatingSummary()

    const tg = await truyenGenresService.getByTruyen(story.value.id)
    const ids = normalizePaged(tg).map((x) => x.genreId ?? x.id ?? x)
    const map = new Map(genresStore.genres.map(g => [g.id, g.name]))
    genreNames.value = ids.map((id) => map.get(id)).filter(Boolean)

    if (authStore.isAuthenticated) {
      await loadFavoriteStatus()
      await loadFollowStatus()
    }
  } catch (e) {
    error.value = e.message || 'Không thể tải truyện'
  } finally {
    loading.value = false
  }
}

async function loadFavoriteStatus() {
  if (!story.value?.id) return
  const res = await favoritesService.getMine({ page: 0, size: 100 })
  const list = normalizePaged(res)
  isFavorite.value = list.some((f) => f.truyenId === story.value.id)
}

async function loadFollowStatus() {
  if (!story.value?.authorId) return
  const res = await followsService.getFollowing({ page: 0, size: 100 })
  const list = normalizePaged(res)
  isFollowing.value = list.some((f) => f.followingId === story.value.authorId)
}

async function loadRatingSummary() {
  if (!story.value?.id) return
  try {
    const summary = await ratingsService.getSummary(story.value.id)
    ratingSummary.value = {
      myRating: summary?.myRating ?? null,
      averageRounded: summary?.averageRounded ?? 0,
      count: summary?.count ?? 0
    }
    if (ratingSummary.value.myRating) {
      selectedRating.value = Number(ratingSummary.value.myRating)
    } else {
      selectedRating.value = 0
    }
  } catch {
    ratingSummary.value = { myRating: null, averageRounded: 0, count: 0 }
    selectedRating.value = 0
  }
}

async function loadComments() {
  if (!story.value?.id) return
  try {
    const data = await commentsService.getAll({ page: 0, size: 10, truyenId: story.value.id })
    comments.value = normalizePaged(data)
  } catch {
    comments.value = []
  }
}

async function postComment() {
  const content = String(newComment.value || '').trim()
  if (!content) return
  commentError.value = ''
  if (!authStore.isAuthenticated) {
    commentError.value = 'Vui lòng đăng nhập để bình luận.'
    return
  }
  if (!story.value?.id) return
  try {
    const created = await commentsService.create({ truyenId: story.value.id, content })
    if (created) {
      comments.value = [created, ...comments.value]
    }
    newComment.value = ''
  } catch (e) {
    commentError.value = e.message || 'Không thể gửi bình luận.'
  }
}

async function toggleFavorite() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!story.value?.id) return
  if (isFavorite.value) {
    await favoritesService.remove(story.value.id)
    isFavorite.value = false
  } else {
    await favoritesService.add(story.value.id)
    isFavorite.value = true
  }
}

async function toggleFollow() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  if (!story.value?.authorId) return
  if (isFollowing.value) {
    await followsService.unfollow(story.value.authorId)
    isFollowing.value = false
  } else {
    await followsService.follow(story.value.authorId)
    isFollowing.value = true
  }
}

async function rate(value) {
  if (!authStore.isAuthenticated) {
    ratingError.value = 'Vui lòng đăng nhập để đánh giá.'
    return
  }
  if (!story.value?.id) return
  ratingError.value = ''
  selectedRating.value = value
  try {
    const summary = await ratingsService.rate(story.value.id, value)
    ratingSummary.value = {
      myRating: summary?.myRating ?? value,
      averageRounded: summary?.averageRounded ?? ratingSummary.value.averageRounded ?? 0,
      count: summary?.count ?? ratingSummary.value.count ?? 0
    }
    if (ratingSummary.value.myRating) {
      selectedRating.value = Number(ratingSummary.value.myRating)
    }
  } catch (e) {
    ratingError.value = e.message || 'Không thể đánh giá.'
  }
}

watch(
  () => route.params.id,
  async () => {
    await loadGenres()
    await loadStory()
  },
  { immediate: true }
)

onMounted(loadGenres)
</script>

