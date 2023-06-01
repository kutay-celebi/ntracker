<script setup lang="ts">
import { PropType } from 'vue'
import { EntryDO } from '../../../preload/db/types/Entry'

const props = defineProps({
  data: {
    type: null as unknown as PropType<EntryDO>
  },
  show: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <el-dialog>
    <el-card :title="props.data.label"> test </el-card>
  </el-dialog>
</template>

<style scoped lang="less"></style>
