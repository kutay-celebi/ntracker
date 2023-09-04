<script setup lang="ts">
import { EntryReportDO } from '../../../main/db/types/EntryReportDO'
import { computed, PropType, ref, watch } from 'vue'
import { EntryDO } from '../../../main/db/types/Entry'
import MarkdownRenderer from '@renderer/components/MarkdownRenderer.vue'

const props = defineProps({
  entry: {
    type: null as unknown as PropType<EntryDO | undefined>
  }
})
const entryReport = ref<EntryReportDO>()
const title = computed(() => {
  return props.entry ? props.entry.label : 'Overview'
})

watch(
  () => [props.entry],
  () => {
    prepareReport()
  }
)
const prepareReport = async () => {
  if (props.entry && props.entry.id) {
    await window.api.getEntryReport(props.entry.id).then((value) => {
      entryReport.value = value
    })
  } else {
    entryReport.value = undefined
  }
}
</script>

<template>
  <el-card :header="title">
    <div v-if="entryReport">
      <markdown-renderer v-if="entryReport.notes" :markdown="entryReport.notes" />

      <h1>Total Hours:</h1>
      <el-table :data="entryReport.monthly" show-summary>
        <el-table-column label="Entry" prop="date" />
        <el-table-column label="Sum" prop="sum" />
      </el-table>
    </div>
    <el-alert v-else show-icon type="info" :closable="false" effect="dark"> Select row first. </el-alert>
  </el-card>
</template>

<style scoped lang="less"></style>
