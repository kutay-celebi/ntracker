import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import dayjs from 'dayjs'
import 'element-plus/dist/index.css'
import utc from 'dayjs/plugin/utc'
import updateLocale from 'dayjs/plugin/updateLocale'
import { createRouter, createWebHashHistory } from 'vue-router'
import TimeSheet from '@renderer/views/TimeSheet.vue'
import Todo from '@renderer/views/Todo.vue'
import { createPinia } from 'pinia'
import AppSettings from '@renderer/views/AppSettings.vue'
import 'highlight.js/styles/github.css'

dayjs.extend(utc)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1
})

const pinia = createPinia()

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/timesheet',
      children: [
        {
          path: '/timesheet',
          component: TimeSheet
        },
        {
          path: '/todo',
          component: Todo
        },
        {
          path: '/settings',
          component: AppSettings
        }
      ]
    }
  ]
})

createApp(App).use(ElementPlus).use(pinia).use(router).mount('#app')
