import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Create app
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)

// Mount to DOM
app.mount('#app')

// Debug log
console.log('App mounted with router:', router)