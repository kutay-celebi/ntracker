<script setup lang="ts">
import { ref } from 'vue'
import { EntryDO } from '@main/db/types/Entry'
import { EntryReportDO } from '@main/db/types/EntryReportDO'
import { EntryReportItemDO } from '@main/db/types/EntryReportItemDO'
import { useUtil } from '@renderer/compositions/helper'

const { formatHours, formatMonth } = useUtil()

const searchLabel = ref('')
const suggestions = ref<EntryDO[]>([])
const selectedEntry = ref<EntryDO | null>(null)
const report = ref<EntryReportDO | null>(null)
const isLoading = ref(false)

const fetchSuggestions = async (query: string, cb: (results: { value: string; entry: EntryDO }[]) => void) => {
  if (!query || query.trim().length < 1) {
    cb([])
    return
  }
  const result = await window.api.queryEntries({ label: query.trim() })
  suggestions.value = result
  cb(result.map((e) => ({ value: e.label, entry: e })))
}

const onSelect = async (item: { value: string; entry: EntryDO }) => {
  selectedEntry.value = item.entry
  report.value = null
  if (!item.entry.id) return

  isLoading.value = true
  try {
    report.value = await window.api.getEntryReport(item.entry.id)
  } finally {
    isLoading.value = false
  }
}

const sortedMonthly = (monthly: EntryReportItemDO[]) => [...monthly].sort((a, b) => (a.date! > b.date! ? -1 : 1))
</script>

<template>
  <div class="entry-report-view">
    <el-card>
      <template #header>
        <span class="report-title">Entry Report</span>
      </template>

      <el-autocomplete
        v-model="searchLabel"
        :fetch-suggestions="fetchSuggestions"
        placeholder="Search entry by label..."
        style="width: 360px"
        clearable
        @select="onSelect"
      />

      <div v-if="isLoading" style="margin-top: 24px; text-align: center">
        <el-icon class="is-loading"><i class="el-icon-loading" /></el-icon>
        <span style="margin-left: 8px">Loading report...</span>
      </div>

      <template v-if="!isLoading && report && selectedEntry">
        <div class="entry-report-summary">
          <el-descriptions :column="3" border style="margin-top: 20px">
            <el-descriptions-item label="Entry">
              <strong>{{ selectedEntry.label }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="Total Hours">
              <el-tag type="primary">{{ formatHours(report.all.sum) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedEntry.estimation && selectedEntry.estimation > 0" label="Estimation">
              <el-tag :type="report.all.sum <= selectedEntry.estimation ? 'success' : 'danger'">
                {{ formatHours(selectedEntry.estimation) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-table
          :data="sortedMonthly(report.monthly)"
          stripe
          style="width: 100%; margin-top: 16px"
          empty-text="No time logged for this entry"
          show-summary
          :summary-method="() => ['Total', formatHours(report!.all.sum)]"
        >
          <el-table-column label="Month" min-width="200">
            <template #default="{ row }">
              {{ formatMonth(row.date) }}
            </template>
          </el-table-column>
          <el-table-column label="Hours" width="140" align="right">
            <template #default="{ row }">
              <el-tag type="info">{{ formatHours(row.sum) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.entry-report-view {
  height: 100%;
}

.report-title {
  font-size: 16px;
  font-weight: 600;
}

.entry-report-summary {
  margin-top: 16px;
}
</style>
