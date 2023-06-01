import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/styles'
import ElementPlus, { dayjs } from 'element-plus'
import 'element-plus/dist/index.css'
import utc from 'dayjs/plugin/utc'
import updateLocale from 'dayjs/plugin/updateLocale'

dayjs.extend(utc)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1
})

createApp(App).use(ElementPlus).mount('#app')
