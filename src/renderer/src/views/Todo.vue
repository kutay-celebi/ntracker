<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { TodoDO } from '../../../preload/db/types/Todo'
import List from '@renderer/components/List.vue'
import ListItem from '@renderer/components/ListItem.vue'
import IconoirCircle from '~icons/iconoir/circle'
import IconoirCheckCircle from '~icons/iconoir/check-circle'

const activeTab = ref('today')
const todos = ref<TodoDO[]>([])

onMounted(async () => {
  await window.api.getTodods().then((resp) => (todos.value = resp))
})

const toggleTodo = (todo: TodoDO) => {
  todo.completed = !todo.completed
}
</script>

<template>
  <el-card class="my-2">
    <el-tabs v-model="activeTab" mode="horizontal" class="my-2">
      <el-tab-pane label="Today" name="today">
        <list data=""> </list>
        <list>
          <list-item v-for="(todo, idx) in todos" :key="idx" :class="[{ completed: todo.completed }, 'todo-item']">
            <template #prefix>
              <transition name="slide">
                <iconoir-circle v-if="!todo.completed" class="todo-icon clickable" @click="() => toggleTodo(todo)" />
                <iconoir-check-circle v-else class="todo-icon icon-success clickable" @click="() => toggleTodo(todo)" />
              </transition>
            </template>
            <div :class="[{ 'is-completed': todo.completed }, 'strike', 'mx-2']">{{ todo.label }}</div>
          </list-item>
        </list>
      </el-tab-pane>
      <el-tab-pane label="Completed" name="completed">Completed</el-tab-pane>
      <el-tab-pane label="All" name="all">All Todo</el-tab-pane>
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
</style>
