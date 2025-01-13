import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const app = createApp(App)

// Vuetify
const vuetify = createVuetify({
  components,
  directives,
  date: {
    locale: {
      en: 'en-US'
    }
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  }
})

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
