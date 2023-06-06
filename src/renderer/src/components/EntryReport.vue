<script setup lang="ts">
import { EntryReportDO } from '../../../main/db/types/EntryReportDO'
import { PropType, ref, watch } from 'vue'
import { EntryDO } from '../../../main/db/types/Entry'

const props = defineProps({
  entry: {
    type: null as unknown as PropType<EntryDO | undefined>
  }
})
const entryReport = ref<EntryReportDO>()

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
  <el-card header="Report">
    <div v-if="entryReport">
      <el-table :data="entryReport.monthly" show-summary>
        <el-table-column label="Entry" prop="date" />
        <el-table-column label="Sum" prop="sum" />
      </el-table>
    </div>
    <el-alert v-else show-icon type="info" :closable="false" effect="dark"> Select row first. </el-alert>
  </el-card>
</template>

<style scoped lang="less"></style>
