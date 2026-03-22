import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores'

// route groups split for clarity
import publicRoutes from './publicRoutes'
import adminRoutes from './adminRoutes'

const routes = [
  ...publicRoutes,
  ...adminRoutes
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
    if (!auth.user) {
      await auth.fetchMe()
    }
    if (!auth.isAdmin) {
      return next({ name: 'Home' })
    }
  }

  return next()
})

export default router
