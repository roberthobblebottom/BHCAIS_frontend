import { createApp } from 'vue'
import App from './NavBar.vue'
import { createPinia } from 'pinia'
import {router} from './helpers/router.ts'
import PrimeVue  from 'primevue/config'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.mount('#app')

