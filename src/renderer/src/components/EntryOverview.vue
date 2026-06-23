<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import { EntryDO, EntryOverviewDO } from '@main/db/types/Entry'
import { EntryReportDO } from '@main/db/types/EntryReportDO'
import { EntryReportItemDO } from '@main/db/types/EntryReportItemDO'
import { useUtil } from '@renderer/compositions/helper'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import RiSave3Line from '~icons/ri/save-3-line'
import RiDeleteBin5Line from '~icons/ri/delete-bin-5-line'

const props = defineProps({
  modelValue: {
    type: null as unknown as PropType<EntryDO | undefined>
  }
})
const emits = defineEmits(['update:modelValue', 'save', 'delete'])

const innerModelValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

const { formatHours, formatMonth } = useUtil()

const entryOverview = ref<EntryOverviewDO>()
const entryReport = ref<EntryReportDO>()
const title = computed(() => {
  return props.modelValue ? props.modelValue.label : 'Overview'
})

watch(
  () => props.modelValue,
  () => {
    prepareOverview()
  }
)

const sortedMonthly = (monthly: EntryReportItemDO[]) => [...monthly].sort((a, b) => (a.date! > b.date! ? -1 : 1))

const prepareOverview = async () => {
  if (props.modelValue && props.modelValue.id) {
    await Promise.all([
      window.api.getEntryOverview(props.modelValue.id).then((value) => {
        entryOverview.value = value
      }),
      window.api.getEntryReport(props.modelValue.id).then((value) => {
        entryReport.value = value
      })
    ])
  } else {
    entryOverview.value = undefined
    entryReport.value = undefined
  }
}

const saveEntry = () => {
  emits('save')
}

const deleteEntry = () => {
  emits('delete')
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <el-card>
      <template #header>
        <div class="overview-header">
          <span>{{ title }}</span>
          <div style="display: flex; gap: 8px">
            <el-button v-if="entryOverview" type="success" circle title="Save" @click="saveEntry">
              <ri-save3-line />
            </el-button>
            <el-popconfirm
              v-if="entryOverview"
              title="This will permanently delete the entry and all its time log entries."
              width="fit-content"
              @confirm="deleteEntry"
            >
              <template #reference>
                <el-button type="danger" circle title="Delete Entry">
                  <ri-delete-bin5-line />
                </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>

      <template v-if="entryOverview">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Total Time Spent">{{ formatHours(entryOverview.spent) }}</el-descriptions-item>
          <el-descriptions-item label="Estimation">
            <el-input-number
              v-if="innerModelValue"
              v-model="innerModelValue.estimation"
              :min="0"
              :controls="false"
              size="small"
            />
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-alert v-if="!entryOverview" show-icon type="info" :closable="false" effect="dark">
        Select row first.
      </el-alert>
    </el-card>

    <el-card v-if="entryOverview">
      <template #header>
        <span>Notes</span>
      </template>
      <MdEditor
        v-if="innerModelValue"
        :model-value="innerModelValue.notes ?? ''"
        language="en-US"
        :preview-only="false"
        :toolbars="[
          'bold',
          'italic',
          'strikeThrough',
          '-',
          'title',
          'quote',
          'unorderedList',
          'orderedList',
          '-',
          'codeRow',
          'code',
          'link',
          '-',
          'preview'
        ]"
        style="width: 100%"
        @update:model-value="
          (val) => {
            if (innerModelValue) innerModelValue.notes = val
          }
        "
      />
    </el-card>

    <el-card v-if="entryOverview && entryReport && entryReport.monthly.length > 0">
      <template #header>
        <span>Monthly Report</span>
      </template>
      <el-table
        :data="sortedMonthly(entryReport.monthly)"
        stripe
        size="small"
        style="width: 100%"
        show-summary
        :summary-method="() => ['Total', formatHours(entryReport!.all.sum)]"
      >
        <el-table-column label="Month" min-width="160">
          <template #default="{ row }">
            {{ formatMonth(row.date) }}
          </template>
        </el-table-column>
        <el-table-column label="Hours" width="120" align="right">
          <template #default="{ row }">
            <el-tag type="info">{{ formatHours(row.sum) }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="less">
.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
