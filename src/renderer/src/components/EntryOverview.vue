<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import { EntryDO, EntryOverviewDO } from '@main/db/types/Entry'
import MarkdownRenderer from '@renderer/components/MarkdownRenderer.vue'

const props = defineProps({
  entry: {
    type: null as unknown as PropType<EntryDO | undefined>
  }
})
const entryReport = ref<EntryOverviewDO>()
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
    await window.api.getEntryOverview(props.entry.id).then((value) => {
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
      <table class="overview-table">
        <tr>
          <td>Estimation</td>
          <td>{{ entryReport.estimation }}</td>
        </tr>
        <tr>
          <td class="overview-item-label">Total Time Spent</td>
          <td>
            {{ entryReport.estimation }}
          </td>
        </tr>
        <tr>
          <td>Notes</td>
          <td>
            <markdown-renderer v-if="entryReport.notes" :markdown="entryReport.notes" />
          </td>
        </tr>
      </table>
    </div>
    <el-alert v-else show-icon type="info" :closable="false" effect="dark"> Select row first. </el-alert>
  </el-card>
</template>

<style scoped lang="less">
.overview-table {
  width: 100%;
  border-spacing: 0;
  border-collapse: collapse;
  td {
    padding: 0.5rem;
    border: var(--el-border);
  }

  tr {
    td:first-child {
      background: var(--el-fill-color);
      width: 20%;
    }
  }
}

.overview-item-label {
  white-space: nowrap;
}
</style>
