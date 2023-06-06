<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue'
import { TodoDO, TodoListQuery } from '../../../main/db/types/Todo'
import List from '@renderer/components/List.vue'
import ListItem from '@renderer/components/ListItem.vue'
import IconoirAddCircle from '~icons/iconoir/add-circle'
import IconoirCircle from '~icons/iconoir/circle'
import IconoirCheckCircle from '~icons/iconoir/check-circle'
import dayjs from 'dayjs'
import { useUtil } from '@renderer/compositions/helper'
import { Sort } from '../../../main/db/types/Sort'

const { formatDateTime } = useUtil()

const activeTab = ref('all')
const selectedTodo = ref<TodoDO>()
const todos = ref<TodoDO[]>([])
const todoQuery = ref<TodoListQuery>({ completed: false })
const todoSorts = ref<Sort[]>([
  { field: 'completed', direction: 'asc' },
  { field: 'dueDate', direction: 'asc' }
])

const todoToBeSaved = ref<TodoDO>({ label: '', completed: false })

watch(
  () => activeTab.value,
  (val) => {
    todoQuery.value.completed = undefined
    if (val === 'completed') {
      todoQuery.value = {
        completed: true
      }
    }
    if (val === 'today') {
      todoQuery.value = {
        timeRange: [dayjs().startOf('days').toDate(), dayjs().endOf('days').toDate()]
      }
    }
    if (val === 'all') {
      todoQuery.value = { completed: false }
    }

    todoQuery.value.sorts = todoSorts.value
    fetchTodos()
  }
)

onMounted(async () => {
  await fetchTodos()
})

const fetchTodos = async () => {
  await window.api.getTodods(toRaw(todoQuery.value)).then((resp) => (todos.value = resp))
}

const toggleTodo = async (todo: TodoDO) => {
  todo.completed = !todo.completed
  await window.api.saveTodo(toRaw(todo)).then(() => fetchTodos())
}

const selectTodo = async (todo: TodoDO) => {
  if (todo === selectedTodo.value) {
    selectedTodo.value = undefined
    return
  }

  selectedTodo.value = todo
}

const addTodo = async () => {
  if (activeTab.value === 'today' && !todoToBeSaved.value.dueDate) {
    todoToBeSaved.value.dueDate = dayjs().endOf('days').toDate()
  }

  window.api
    .saveTodo(toRaw(todoToBeSaved.value))
    .then(async () => {
      await fetchTodos()
    })
    .finally(() => {
      todoToBeSaved.value = { label: '', completed: false }
    })
}
</script>

<template>
  <el-card class="my-2">
    <el-tabs v-model="activeTab" mode="horizontal" class="my-2">
      <el-tab-pane label="Today" name="today" />
      <el-tab-pane label="All Uncompleted" name="all" />
      <el-tab-pane label="Completed" name="completed" />
      <el-container>
        <list class="w-100 split-panel">
          <list-item v-for="(todo, idx) in todos" :key="idx" :class="[{ completed: todo.completed }, 'todo-item']">
            <template #prefix>
              <transition name="slide">
                <iconoir-circle v-if="!todo.completed" class="todo-icon clickable" @click="() => toggleTodo(todo)" />
                <iconoir-check-circle v-else class="todo-icon icon-success clickable" @click="() => toggleTodo(todo)" />
              </transition>
            </template>
            <div :class="[{ 'is-completed': todo.completed }, 'strike', 'mx-2']" @click="() => selectTodo(todo)">
              {{ todo.label }}
            </div>
          </list-item>
          <list-item v-if="activeTab !== 'completed'">
            <div class="todo-form">
              <el-input v-model="todoToBeSaved.label" size="large" placeholder="Todo" @keydown.enter="addTodo" />
              <el-date-picker
                v-if="activeTab === 'all'"
                v-model="todoToBeSaved.dueDate"
                size="large"
                type="datetime"
                class="todo-date-picker"
                placeholder="Due Date"
                clearable
              />
              <div class="add-todo-icon">
                <iconoir-add-circle @click="addTodo" />
              </div>
            </div>
          </list-item>
        </list>
        <el-card
          :class="['w-0', { active: !!selectedTodo }, { deactive: !selectedTodo }, 'split-panel']"
          shadow="never"
          style="overflow: hidden"
        >
          <el-descriptions v-if="selectedTodo" :title="selectedTodo.label">
            <el-descriptions-item label="Due date">
              {{ formatDateTime(selectedTodo.dueDate) }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-container>
    </el-tabs>
  </el-card>
</template>

<style scoped lang="less">
.todo-item {
  transition: color 0.3s ease;
}

.todo-icon {
  transition: all 0.3s ease;
  user-select: none;
}

.icon-success {
  color: var(--el-color-success);
}

.completed {
  color: var(--el-disabled-text-color) !important;
}

.strike {
  position: relative;
}

.strike::after {
  content: ' ';
  position: absolute;
  top: 50%;
  left: 0;
  width: 0;
  height: 1px;
  background: black;
  transition: width 0.3s ease;
}

.completed > .strike::after {
  width: 100%;
}

.slide-leave-to,
.slide-enter-from {
  transform: translateX(-10px);
  opacity: 0;
}

.slide-leave-active {
  position: absolute;
}

.split-panel {
  transition: all 0.3s ease;
}

.split-panel.deactive {
  opacity: 0;
  width: 0;
}

.split-panel.active {
  opacity: 1;
  width: 100%;
}

.todo-form {
  display: flex;
  width: 100%;
}

.add-todo-icon {
  display: flex;
  svg {
    align-self: center;
  }
  height: 40px;
  font-size: 20px;
  margin-left: 1rem;
  cursor: pointer;
  color: var(--el-color-success);
}
</style>
