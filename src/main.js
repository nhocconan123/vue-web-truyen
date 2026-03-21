import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerBaseComponents } from './components'

const app = createApp(App)
app.use(createPinia())
app.use(router)
registerBaseComponents(app)
app.mount('#app')
