import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import FormField from './FormField.vue'
import AppHeader from './Header.vue'
import AppFooter from './Footer.vue'

export { BaseButton, BaseInput, BaseTextarea, FormField, AppHeader, AppFooter }

// Optional: helper to register globally in a Vue app
export function registerBaseComponents(app) {
  app.component('BaseButton', BaseButton)
  app.component('BaseInput', BaseInput)
  app.component('BaseTextarea', BaseTextarea)
  app.component('FormField', FormField)
  app.component('AppHeader', AppHeader)
  app.component('AppFooter', AppFooter)
}
