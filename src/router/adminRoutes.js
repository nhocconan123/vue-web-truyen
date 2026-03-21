import AdminLayout from '../admin/layouts/AdminLayout.vue'
import AdminDashboard from '../admin/pages/AdminDashboard.vue'
import AdminNewStory from '../admin/pages/AdminNewStory.vue'
import AdminUsers from '../admin/pages/AdminUsers.vue'
import AdminCategories from '../admin/pages/AdminCategories.vue'

export default [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard
      },
      {
        path: 'stories/new',
        name: 'AdminNewStory',
        component: AdminNewStory
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: AdminCategories
      }
    ]
  }
]
