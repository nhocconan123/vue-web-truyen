<template>
  <header class="site-header">
    <div class="header-shell">
      <div class="brand-nav">
        <router-link to="/" class="brand">
          <div class="brand-mark">
            <img :src="logoUrl" alt="logo" class="brand-logo" />
          </div>
          <span class="brand-name">Web truyện</span>
        </router-link>
        <nav class="nav-links">
          <div class="nav-item">
            <button
              type="button"
              class="nav-link"
              @click="toggleGenres"
            >
              Thể loại
              <span class="nav-caret">▾</span>
            </button>
            <div
              v-if="showGenres"
              class="dropdown-panel"
              @mouseleave="closeGenres"
            >
              <router-link
                to="/categories"
                class="dropdown-link dropdown-all"
                @click="closeGenres"
              >
                Tất cả thể loại
              </router-link>
              <router-link
                v-for="g in genres"
                :key="g.id"
                :to="genreLink(g)"
                class="dropdown-link"
                @click="closeGenres"
              >
                {{ g.name }}
              </router-link>
            </div>
          </div>
          <router-link to="/top" class="nav-link">Danh sách</router-link>
        </nav>
      </div>

      <div class="header-actions">
        <form class="search" @submit.prevent="submitSearch">
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </span>
          <input
            v-model="keyword"
            placeholder="Tìm truyện..."
            class="search-input"
          />
        </form>
        <div v-if="!auth.isAuthenticated" class="auth-actions">
          <router-link to="/login" class="btn btn-primary">Đăng nhập</router-link>
          <router-link to="/register" class="btn btn-ghost">Đăng ký</router-link>
        </div>
        <div v-else class="auth-actions">
          <router-link to="/me" class="user-pill">
            Xin chào, {{ auth.user?.username || 'Bạn' }}
          </router-link>
          <button @click="logout" class="btn btn-ghost">Đăng xuất</button>
        </div>
      </div>

      <nav class="mobile-nav">
        <router-link to="/" class="mobile-link">Trang chủ</router-link>
        <router-link to="/categories" class="mobile-link">Thể loại</router-link>
        <router-link to="/top" class="mobile-link">Top</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useGenreStore } from '../stores'
import logoUrl from '@/assets/logo.png'

const auth = useAuthStore()
const genreStore = useGenreStore()
const router = useRouter()
const route = useRoute()
const keyword = ref(route.query.keyword || '')
const showGenres = ref(false)
const genres = computed(() => genreStore.genres)

watch(
  () => route.query.keyword,
  (val) => {
    keyword.value = val || ''
  }
)

async function submitSearch() {
  const query = { ...route.query, keyword: keyword.value || undefined }
  if (!query.keyword) delete query.keyword
  await router.push({ name: 'Home', query })
}

function toggleGenres() {
  showGenres.value = !showGenres.value
}

function closeGenres() {
  showGenres.value = false
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function genreLink(genre) {
  const slug = genre.slug || slugify(genre.name) || String(genre.id)
  return { name: 'GenreDetail', params: { slug } }
}

function logout() {
  auth.logout()
}

onMounted(() => {
  if (auth.isAuthenticated && !auth.user) {
    auth.fetchMe()
  }
  if (!genreStore.genres.length) {
    genreStore.fetchGenres()
  }
})

watch(
  () => route.fullPath,
  () => {
    closeGenres()
  }
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.site-header {
  width: 100%;
  background:
    radial-gradient(900px circle at 15% -10%, rgba(20, 83, 45, 0.12), transparent 55%),
    radial-gradient(900px circle at 85% 140%, rgba(14, 116, 144, 0.12), transparent 60%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #ecfeff 100%);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 14px 30px -24px rgba(15, 23, 42, 0.55);
}

.header-shell {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: 'Space Grotesk', 'Noto Sans', sans-serif;
}

.brand-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(145deg, #e2e8f0, #ffffff);
  border: 1px solid #e2e8f0;
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.8);
}

.brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.brand-name {
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0f172a;
  font-size: 18px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.04);
}

.nav-links {
  display: none;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #0f766e;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  color: #0f766e;
  text-decoration: none;
  font-weight: 600;
  transition: all 150ms ease;
}

.nav-link:hover {
  color: #0f172a;
  background: rgba(15, 118, 110, 0.08);
}

.nav-caret {
  font-size: 12px;
  color: #0f766e;
}

.dropdown-panel {
  position: absolute;
  top: 42px;
  left: 0;
  width: 220px;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 35px -28px rgba(15, 23, 42, 0.6);
  padding: 8px;
  z-index: 50;
}

.dropdown-link {
  display: block;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  color: #334155;
  text-decoration: none;
}

.dropdown-link:hover {
  background: #f1f5f9;
}

.dropdown-all {
  font-weight: 600;
  color: #0f172a;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.search-icon svg {
  width: 100%;
  height: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  color: #0f172a;
  outline: none;
  transition: border 150ms ease, box-shadow 150ms ease;
}

.search-input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.12);
}

.auth-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 150ms ease;
}

.btn-primary {
  background: #16a34a;
  color: #ffffff;
  box-shadow: 0 10px 20px -15px rgba(22, 163, 74, 0.6);
}

.btn-primary:hover {
  background: #15803d;
}

.btn-ghost {
  background: #ffffff;
  color: #0f172a;
  border-color: #e2e8f0;
}

.btn-ghost:hover {
  background: #f8fafc;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.mobile-nav {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: #475569;
}

.mobile-link {
  color: #475569;
  text-decoration: none;
  font-weight: 600;
}

.mobile-link:hover {
  color: #0f172a;
}

@media (min-width: 768px) {
  .header-shell {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 18px 28px;
  }

  .brand-nav {
    justify-content: flex-start;
  }

  .nav-links {
    display: inline-flex;
  }

  .header-actions {
    flex-direction: row;
    align-items: center;
  }

  .search {
    width: 280px;
  }

  .mobile-nav {
    display: none;
  }
}
</style>
