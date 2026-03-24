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
          <div class="user-menu" ref="userMenuRef">
            <button
              type="button"
              class="user-trigger"
              @click.stop="toggleUserMenu"
              aria-haspopup="true"
              :aria-expanded="showUserMenu"
            >
              <span class="user-avatar" aria-hidden="true">
                <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="" />
                <span v-else>{{ userInitials }}</span>
              </span>
              <span class="user-name">{{ auth.user?.username || 'Bạn' }}</span>
              <span class="nav-caret">▾</span>
            </button>
            <div v-if="showUserMenu" class="dropdown-panel user-dropdown" @click.stop>
              <div class="dropdown-top">
                <button
                  type="button"
                  class="theme-toggle"
                  :class="{ 'is-dark': themeMode === 'dark' }"
                  :aria-label="themeMode === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
                  @click="toggleThemeMode"
                >
                  <span class="theme-icon theme-icon--sun" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.5" />
                      <path d="M12 2.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M12 19V21.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M4.5 12H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      <path d="M22 12H19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                    </svg>
                  </span>
                  <span class="theme-icon theme-icon--moon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.2 14.4C19.4 14.7 18.5 14.9 17.6 14.9C13.7 14.9 10.6 11.8 10.6 7.9C10.6 7 10.7 6.1 11 5.3C7.7 6.3 5.4 9.3 5.4 12.8C5.4 17.1 8.9 20.6 13.2 20.6C16.6 20.6 19.6 18.3 20.6 15C20.5 14.8 20.4 14.6 20.2 14.4Z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                  <span class="theme-thumb" aria-hidden="true">
                    <span class="theme-thumb-icon">
                      <svg v-if="themeMode === 'dark'" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20.2 14.4C19.4 14.7 18.5 14.9 17.6 14.9C13.7 14.9 10.6 11.8 10.6 7.9C10.6 7 10.7 6.1 11 5.3C7.7 6.3 5.4 9.3 5.4 12.8C5.4 17.1 8.9 20.6 13.2 20.6C16.6 20.6 19.6 18.3 20.6 15C20.5 14.8 20.4 14.6 20.2 14.4Z"
                          stroke="currentColor"
                          stroke-width="1.5"
                          stroke-linejoin="round"
                        />
                      </svg>
                      <svg v-else viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.5" />
                        <path d="M12 2.5V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M12 19V21.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M4.5 12H2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                        <path d="M22 12H19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                      </svg>
                    </span>
                  </span>
                </button>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/admin" class="dropdown-link" @click="closeUserMenu">
                Dashboard
              </router-link>
              <button type="button" class="dropdown-link" @click="toggleEditName">
                Sửa tên user
              </button>
              <div v-if="showEditName" class="dropdown-edit">
                <input
                  v-model="editUsername"
                  class="dropdown-input"
                  type="text"
                  placeholder="Nhập tên mới"
                />
                <div class="dropdown-actions">
                  <button
                    type="button"
                    class="dropdown-action primary"
                    :disabled="savingName"
                    @click="saveUsername"
                  >
                    {{ savingName ? 'Đang lưu...' : 'Lưu' }}
                  </button>
                  <button type="button" class="dropdown-action" @click="cancelEditName">
                    Huỷ
                  </button>
                </div>
                <p v-if="nameError" class="dropdown-error">{{ nameError }}</p>
              </div>
              <button type="button" class="dropdown-link danger" @click="logout">
                Đăng xuất
              </button>
            </div>
          </div>
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
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useGenreStore } from '../stores'
import usersService from '../services/users'
import logoUrl from '@/assets/logo.png'

const auth = useAuthStore()
const genreStore = useGenreStore()
const router = useRouter()
const route = useRoute()
const keyword = ref(route.query.keyword || '')
const showGenres = ref(false)
const genres = computed(() => genreStore.genres)
const showUserMenu = ref(false)
const showEditName = ref(false)
const editUsername = ref('')
const nameError = ref('')
const savingName = ref(false)
const userMenuRef = ref(null)
const THEME_MODE_KEY = 'ui_theme_mode'
const themeMode = ref(localStorage.getItem(THEME_MODE_KEY) === 'dark' ? 'dark' : 'light')


const userInitials = computed(() => {
  const name = String(auth.user?.username || '').trim()
  if (!name) return 'U'
  const parts = name.split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})

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
  if (showGenres.value) {
    closeUserMenu()
  }
}

function closeGenres() {
  showGenres.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    closeGenres()
  }
}

function closeUserMenu() {
  showUserMenu.value = false
  showEditName.value = false
  nameError.value = ''
}

function toggleEditName() {
  showEditName.value = !showEditName.value
  nameError.value = ''
  editUsername.value = auth.user?.username || ''
}

function cancelEditName() {
  showEditName.value = false
  nameError.value = ''
}

async function saveUsername() {
  const nextName = String(editUsername.value || '').trim()
  if (!nextName) {
    nameError.value = 'Tên đăng nhập không được để trống.'
    return
  }
  if (!auth.user?.id) {
    nameError.value = 'Không tìm thấy tài khoản.'
    return
  }
  savingName.value = true
  nameError.value = ''
  try {
    const updated = await usersService.update(auth.user.id, { username: nextName })
    auth.setUser({
      ...auth.user,
      username: updated?.username || nextName
    })
    showEditName.value = false
  } catch (e) {
    nameError.value = e?.response?.data?.message || e?.message || 'Lưu thất bại.'
  } finally {
    savingName.value = false
  }
}

function applyThemeMode(mode) {
  const nextMode = mode === 'dark' ? 'dark' : 'light'
  themeMode.value = nextMode
  localStorage.setItem(THEME_MODE_KEY, nextMode)
  document.documentElement.classList.toggle('theme-dark', nextMode === 'dark')
  document.documentElement.classList.toggle('theme-light', nextMode === 'light')
}

function toggleThemeMode() {
  applyThemeMode(themeMode.value === 'dark' ? 'light' : 'dark')
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
  applyThemeMode(themeMode.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (!showUserMenu.value) return
  if (!userMenuRef.value) return
  if (!userMenuRef.value.contains(event.target)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

watch(
  () => route.fullPath,
  () => {
    closeGenres()
    closeUserMenu()
  }
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.site-header {
  width: 100%;
  background: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
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
  color: var(--header-text, #0f172a);
  font-size: 18px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface-muted, rgba(15, 23, 42, 0.04));
}

.nav-links {
  display: none;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--accent-text, #0f766e);
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
  color: var(--accent-text, #0f766e);
  text-decoration: none;
  font-weight: 600;
  transition: all 150ms ease;
}

.nav-link:hover {
  color: #0f172a;
  background: var(--accent-soft, rgba(15, 118, 110, 0.08));
}

.nav-caret {
  font-size: 12px;
  color: var(--accent-text, #0f766e);
}

.dropdown-panel {
  position: absolute;
  top: 42px;
  left: 0;
  width: 220px;
  background: var(--surface, #ffffff);
  border-radius: 14px;
  border: 1px solid var(--color-border, #e2e8f0);
  box-shadow: 0 20px 35px -28px rgba(15, 23, 42, 0.6);
  padding: 8px;
  z-index: 50;
}

.dropdown-link {
  display: block;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--color-text, #334155);
  text-decoration: none;
}

.dropdown-link:hover {
  background: var(--surface-muted, #f1f5f9);
}

.dropdown-all {
  font-weight: 600;
  color: var(--header-text, #0f172a);
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
  color: var(--text-muted, #94a3b8);
}

.search-icon svg {
  width: 100%;
  height: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--input-bg, rgba(255, 255, 255, 0.9));
  font-size: 14px;
  color: var(--color-text, #0f172a);
  outline: none;
  transition: border 150ms ease, box-shadow 150ms ease;
}

.search-input:focus {
  border-color: var(--accent, #22c55e);
  box-shadow: 0 0 0 4px var(--accent-soft, rgba(34, 197, 94, 0.12));
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
  background: var(--accent, #16a34a);
  color: #ffffff;
  box-shadow: 0 10px 20px -15px var(--accent-glow, rgba(22, 163, 74, 0.6));
}

.btn-primary:hover {
  background: var(--accent-hover, #15803d);
}

.btn-ghost {
  background: var(--surface, #ffffff);
  color: var(--header-text, #0f172a);
  border-color: var(--color-border, #e2e8f0);
}

.btn-ghost:hover {
  background: var(--surface-muted, #f8fafc);
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--accent-soft, rgba(15, 118, 110, 0.08));
  color: var(--accent-contrast, #0f172a);
  font-size: 13px;
  font-weight: 600;
  border: 1px solid var(--color-border, rgba(226, 232, 240, 0.8));
  cursor: pointer;
  transition: all 150ms ease;
}

.user-trigger:hover {
  box-shadow: 0 10px 18px -15px rgba(15, 23, 42, 0.4);
  transform: translateY(-1px);
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-text, #0f766e);
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  color: var(--header-text, #0f172a);
}

.user-dropdown {
  right: 0;
  left: auto;
  min-width: 240px;
}

button.dropdown-link {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border, #e2e8f0);
  margin: 8px 4px;
}

.dropdown-edit {
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dropdown-input {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 6px 8px;
  font-size: 13px;
  background: var(--surface, #ffffff);
  color: var(--color-text, #0f172a);
  outline: none;
}

.dropdown-input:focus {
  border-color: var(--accent, #22c55e);
  box-shadow: 0 0 0 3px var(--accent-soft, rgba(34, 197, 94, 0.12));
}

.dropdown-actions {
  display: flex;
  gap: 6px;
}

.dropdown-action {
  flex: 1;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--surface, #ffffff);
  font-size: 12px;
  font-weight: 600;
  color: var(--header-text, #0f172a);
  cursor: pointer;
}

.dropdown-action.primary {
  border-color: transparent;
  background: var(--accent, #16a34a);
  color: #ffffff;
}

.dropdown-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-error {
  font-size: 12px;
  color: #dc2626;
}

.dropdown-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
}

.theme-toggle {
  width: 66px;
  height: 32px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--surface-muted, #f1f5f9);
  color: var(--accent-text, #0f766e);
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  transition: background 180ms ease, box-shadow 150ms ease;
  position: relative;
  overflow: hidden;
}

.theme-toggle:hover {
  box-shadow: 0 10px 18px -15px rgba(15, 23, 42, 0.4);
}

.theme-icon {
  position: absolute;
  width: 14px;
  height: 14px;
  color: var(--text-muted, #64748b);
  opacity: 0.7;
}

.theme-icon svg {
  width: 100%;
  height: 100%;
}

.theme-icon--sun {
  left: 10px;
}

.theme-icon--moon {
  right: 10px;
}

.theme-thumb {
  position: absolute;
  left: 3px;
  top: 3px;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--surface, #ffffff);
  display: grid;
  place-items: center;
  color: var(--accent-text, #0f766e);
  box-shadow: 0 6px 12px -8px rgba(15, 23, 42, 0.45);
  transition: transform 220ms ease;
}

.theme-thumb-icon {
  width: 14px;
  height: 14px;
}

.theme-thumb-icon svg {
  width: 100%;
  height: 100%;
}

.theme-toggle.is-dark .theme-thumb {
  transform: translateX(34px);
}

.theme-toggle.is-dark {
  background: rgba(15, 23, 42, 0.2);
}

.dropdown-link.danger {
  color: #b91c1c;
}

.mobile-nav {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 13px;
  color: var(--text-muted, #475569);
}

.mobile-link {
  color: var(--text-muted, #475569);
  text-decoration: none;
  font-weight: 600;
}

.mobile-link:hover {
  color: var(--header-text, #0f172a);
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
