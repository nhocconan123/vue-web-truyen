import Login from '../pages/LoginNew.vue'
import Register from '../pages/Register.vue'
import Home from '../pages/Home.vue'
import StoryDetail from '../pages/StoryDetail.vue'
import Reader from '../pages/Reader.vue'
import Categories from '../pages/Categories.vue'
import GenreDetail from '../pages/GenreDetail.vue'
import Top from '../pages/Top.vue'
import Profile from '../pages/Profile.vue'
import Forgot from '../pages/Forgot.vue'
import NotFound from '../pages/NotFound.vue'

export default [
  { path: '/login', name: 'Login', component: Login, meta: { hideHeader: true, hideFooter: true } },
  { path: '/register', name: 'Register', component: Register, meta: { hideHeader: true, hideFooter: true } },
  { path: '/forgot', name: 'Forgot', component: Forgot, meta: { hideHeader: true, hideFooter: true } },
  { path: '/', name: 'Home', component: Home },
  { path: '/the-loai/:slug', name: 'GenreDetail', component: GenreDetail },
  { path: '/categories', name: 'Categories', component: Categories },
  { path: '/top', name: 'Top', component: Top },
  { path: '/me', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/story/:id', name: 'StoryDetail', component: StoryDetail, meta: { requiresAuth: false } },
  { path: '/:storySlug/chuong-:chapterSlug', name: 'Reader', component: Reader, meta: { requiresAuth: false, hideHeader: true, hideFooter: true } },
  { path: '/story/:id/read/:chapter', name: 'ReaderLegacy', component: Reader, meta: { requiresAuth: false, hideHeader: true, hideFooter: true } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound, meta: { hideHeader: true, hideFooter: true } }
]
