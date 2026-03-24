import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerBaseComponents } from './components'
import tooltip from './directives/tooltip'

const THEME_MODE_KEY = 'ui_theme_mode'
const savedTheme = localStorage.getItem(THEME_MODE_KEY)
const themeMode = savedTheme === 'dark' ? 'dark' : 'light'
document.documentElement.classList.toggle('theme-dark', themeMode === 'dark')
document.documentElement.classList.toggle('theme-light', themeMode === 'light')

const app = createApp(App)
app.use(createPinia())
app.use(router)
registerBaseComponents(app)
app.directive('tooltip', tooltip)
app.mount('#app')
