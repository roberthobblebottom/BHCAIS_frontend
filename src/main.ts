import { createApp } from 'vue'
import App from './NavBar.vue'
import { createPinia } from 'pinia'
import { router } from './helpers/router.ts'
import { Quasar } from 'quasar'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/material-icons/material-icons.css'

import 'quasar/src/css/index.sass'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, {
    plugins: {}
})
app.mount('#app')

