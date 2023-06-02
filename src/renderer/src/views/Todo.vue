<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue'
import { TodoDO, TodoListQuery } from '../../../preload/db/types/Todo'
import List from '@renderer/components/List.vue'
import ListItem from '@renderer/components/ListItem.vue'
import IconoirCircle from '~icons/iconoir/circle'
import IconoirCheckCircle from '~icons/iconoir/check-circle'
import dayjs from 'dayjs'
import { useUtil } from '@renderer/compositions/helper'

const { formatDateTime } = useUtil()

const activeTab = ref('today')
const selectedTodo = ref<TodoDO>()
const todos = ref<TodoDO[]>([])
const todoQuery = ref<TodoListQuery>({
  timeRange: [dayjs().startOf('days').toDate(), dayjs().endOf('days').toDate()],
  sorts: [
    { field: 'completed', direction: 'asc' },
    { field: 'dueDate', direction: 'asc' }
  ]
})

watch(
  () => activeTab.value,
  (val) => {
    todoQuery.value.completed = undefined
    if (val === 'completed') {
      todoQuery.value.completed = true
    }
    if (val === 'today') {
      todoQuery.value.timeRange = [dayjs().startOf('days').toDate(), dayjs().endOf('days').toDate()]
    }
    if (val === 'all') {
      todoQuery.value.completed = false
      todoQuery.value.timeRange = undefined
    }

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

const selectTodo = (todo: TodoDO) => {
  if (todo === selectedTodo.value) {
    selectedTodo.value = undefined
    return
  }

  selectedTodo.value = todo
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
        </list>
        <el-card :class="['w-0', { 'w-100': !!selectedTodo }, 'split-panel']" shadow="0">
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
</style>
