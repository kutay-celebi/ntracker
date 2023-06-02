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

dayjs.extend(utc)
dayjs.extend(updateLocale)
dayjs.updateLocale('en', {
  weekStart: 1
})

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
        }
      ]
    }
  ]
})

createApp(App).use(ElementPlus).use(router).mount('#app')
