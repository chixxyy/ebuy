import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { installIntlayer } from 'vue-intlayer'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(installIntlayer)

app.mount('#app')
