<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { EntryDO } from '@main/db/types/Entry'
import { EntryListQuery } from '@main/db/types/EntryListQuery'
import { useUtil } from '@renderer/compositions/helper'
import dayjs from 'dayjs'

const { formatHours } = useUtil()

const entries = ref<EntryDO[]>([])
const isLoading = ref(false)

const dateRange = ref<[string, string]>([
  dayjs().startOf('month').format('YYYY-MM-DD'),
  dayjs().endOf('month').format('YYYY-MM-DD')
])

const totalHours = ref(0)

const fetchReport = async () => {
  if (!dateRange.value || dateRange.value.length < 2) return

  isLoading.value = true
  try {
    const query: EntryListQuery = {
      timeRange: [dayjs(dateRange.value[0]).toDate(), dayjs(dateRange.value[1]).endOf('day').toDate()]
    }
    const result = await window.api.queryEntries(query)
    entries.value = result

    totalHours.value = result.reduce((acc, e) => acc + (e.totalDuration ?? 0), 0)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchReport()
})

const shortcuts = [
  {
    text: 'This Month',
    value: () => [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')]
  },
  {
    text: 'Last Month',
    value: () => [
      dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
      dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
    ]
  },
  {
    text: 'This Year',
    value: () => [dayjs().startOf('year').format('YYYY-MM-DD'), dayjs().endOf('year').format('YYYY-MM-DD')]
  }
]
</script>

<template>
  <div class="report-view">
    <el-card>
      <template #header>
        <div class="report-header">
          <span class="report-title">Report</span>
          <div class="report-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="–"
              start-placeholder="Start date"
              end-placeholder="End date"
              :shortcuts="shortcuts"
              :clearable="false"
              format="DD.MM.YYYY"
              value-format="YYYY-MM-DD"
              style="width: 280px"
            />
            <el-button type="primary" :loading="isLoading" @click="fetchReport">Apply</el-button>
          </div>
        </div>
      </template>

      <div class="report-summary">
        <el-statistic title="Total Hours" :value="totalHours" :precision="2" suffix="h" />
        <el-statistic title="Entries" :value="entries.length" />
      </div>

      <el-table
        v-loading="isLoading"
        :data="entries"
        stripe
        style="width: 100%; margin-top: 16px"
        empty-text="No entries found for this period"
        show-summary
        :summary-method="() => ['Total', '', formatHours(totalHours)]"
      >
        <el-table-column prop="label" label="Entry" min-width="200" />
        <el-table-column prop="notes" label="Notes" min-width="300" show-overflow-tooltip />
        <el-table-column label="Hours" width="120" align="right">
          <template #default="{ row }">
            <el-tag type="info">{{ formatHours(row.totalDuration) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.report-view {
  height: 100%;
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .report-title {
    font-size: 16px;
    font-weight: 600;
  }

  .report-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.report-summary {
  display: flex;
  gap: 32px;
  padding: 8px 0 4px;
}
</style>
