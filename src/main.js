import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerBaseComponents } from './components'
import tooltip from './directives/tooltip'

const app = createApp(App)
app.use(createPinia())
app.use(router)
registerBaseComponents(app)
app.directive('tooltip', tooltip)
app.mount('#app')
