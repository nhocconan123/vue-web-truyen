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

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  // không kiểm tra role nữa, chỉ cần xác thực
  // nếu cần xóa meta.requiresAdmin khỏi routes cũng được, nhưng guard sẽ bỏ qua
  
  return next()
})

export default router
