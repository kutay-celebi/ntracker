<script setup lang="ts"></script>

<template>
  <div class="list-item">
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </div>
</template>

<style scoped lang="less">
.list-item {
  display: flex;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: var(--el-border-width) var(--el-border-style) var(--el-border-color);
}
</style>
