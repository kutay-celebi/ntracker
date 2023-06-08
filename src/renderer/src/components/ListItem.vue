<script setup lang="ts"></script>

<template>
  <div class="list-item">
    <slot name="prefix" />
    <div class="list-item-content">
      <slot />
    </div>
    <div class="list-item-suffix">
      <slot name="suffix" />
    </div>
  </div>
</template>

<style scoped lang="less">
.list-item {
  display: flex;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-bottom: var(--el-border-width) var(--el-border-style) var(--el-border-color);
  width: 100%;

  &-content {
    width: 100%;
  }

  &-suffix {
  }
}
</style>
