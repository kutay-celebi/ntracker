<script setup lang="ts">
import { computed, onMounted, reactive, ref, toRaw } from 'vue'
import { EntryDO } from '@main/db/types/Entry'
import { EntryTimelogDO } from '@main/db/types/EntryTimelog'
import RiSave3Line from '~icons/ri/save-3-line'
import IconoirTrash from '~icons/iconoir/trash'
import { EntryListQuery } from '@main/db/types/EntryListQuery'
import dayjs from 'dayjs'
import { useSettingsStore } from '@renderer/store/settigs'
import TimerButton from '@renderer/components/TimerButton.vue'
import RiFileCopy2Line from '~icons/ri/file-copy-2-line'
import RiErrorWarningFill from '~icons/ri/error-warning-fill'
import EntryOverview from '@renderer/components/EntryOverview.vue'

const settings = useSettingsStore()

const isLoading = ref(false)
const isNewEntry = ref(true)
const entry = ref<EntryDO>({ label: '', notes: '', estimation: 0 })
const isUnsavedChange = ref(false)
const selectedDate = ref<Date>(new Date())

const searchEntry = ref('')

const entries = ref<EntryDO[]>([])

const selectedRow = ref<EntryDO>()

const columns = computed(() => {
  let date = dayjs(selectedDate.value).startOf('days').startOf('weeks')
  const cols: any[] = []
  for (let i = 0; i < (settings.timesheet.onlyWeekDays ? 5 : 7); i++) {
    cols.push({ props: date.toDate(), label: date.format('ddd') })
    date = date.add(1, 'days')
  }
  return cols
})

const isToday = computed(() => dayjs().isSame(dayjs(selectedDate.value), 'week'))

onMounted(async () => {
  await getAllEntries()
})

const rawInputs = reactive<Record<string, string>>({})
const timelogKey = (tl: EntryTimelogDO): string => `${tl.entry_id}-${+tl.date}`

const formatDuration = (val: number): string => {
  if (!val || val <= 0) return '0:00'
  const h = Math.floor(val)
  const m = Math.round((val - h) * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const parseDuration = (val: string): number => {
  if (!val || val.trim() === '') return 0
  const trimmed = val.trim()
  if (trimmed.includes(':')) {
    const [hStr, mStr] = trimmed.split(':')
    const h = parseInt(hStr) || 0
    const m = parseInt(mStr) || 0
    return h + m / 60
  }
  return parseFloat(trimmed) || 0
}

const resetState = () => {
  searchEntry.value = ''
  entry.value = { label: '', estimation: 0 }
  isNewEntry.value = true
}

const addEntry = async () => {
  const timelogs: EntryTimelogDO[] = []
  entry.value.label = searchEntry.value.trim()

  let date = dayjs(selectedDate.value).startOf('weeks').startOf('days')
  for (let i = 0; i < 7; i++) {
    timelogs.push({ date: date.toDate(), duration: 0.0 })
    date = date.add(1, 'days')
  }

  if (!entries.value.some((e) => e.id === entry.value.id || searchEntry.value === e.label)) {
    entries.value.push({ ...entry.value, timelogs: timelogs })
  }

  await saveAll()
}

const saveAll = async () => {
  await window.api
    .saveEntry(toRaw(entries.value))
    .then(async () => {
      isUnsavedChange.value = false
    })
    .finally(async () => {
      await getAllEntries()
      resetState()
    })
}

const removeEntry = () => {
  if (selectedRow.value && selectedRow.value?.id) {
    window.api.removeEntry(selectedRow.value.id).then(async () => {
      await getAllEntries()
      selectedRow.value = undefined
    })
  }
}

const getSumOfColumn = ({ columns: cols, data }) => {
  if (!data) {
    return []
  }

  const sums: any[] = []
  let total = 0
  let startOf = dayjs(selectedDate.value).startOf('weeks').startOf('days')
  cols.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'SUM'
      return
    }

    if (index === cols.length - 1 || index === cols.length - 2) {
      sums[index] = ''
      return
    }

    const rowSum = data
      .filter((entry) => entry.timelogs)
      .flatMap((entry) =>
        entry.timelogs.filter((tl) => dayjs(tl.date).startOf('days').isSame(startOf)).map((val) => val.duration)
      )
      .reduce((val1, val2) => val1 + val2, 0)
    sums[index] = formatDuration(rowSum)
    total += rowSum

    startOf = startOf.add(1, 'days')
  })

  sums[sums.length - 3] = formatDuration(total)

  return sums
}

const removeTimeLogs = async (entry: EntryDO) => {
  if (!entry.timelogs) {
    return
  }

  const ids = entry.timelogs.map((tl) => tl.id)
  if (ids) {
    await window.api.removeTimelogsByIds(ids as string[]).then(() => {
      getAllEntries()
    })
  }
}

const selectRow = (val: EntryDO) => {
  selectedRow.value = { ...toRaw(val) }
}

const setUnsavedChangeTrue = () => {
  isUnsavedChange.value = true
}

const selectEntry = async (item: EntryDO) => {
  entry.value = item
  isNewEntry.value = false
}

const queryAutoComplete = async (text: string, cb: any) => {
  isNewEntry.value = true
  await fetchEntries({ label: text }).then((resp) => {
    if (settings.timesheet.forceLabel) {
      const toBeSelected = resp.find((entry) => entry.label.toLowerCase() === text.trim().toLowerCase())
      if (toBeSelected) {
        selectEntry(toBeSelected)
      } else {
        entry.value = { label: '', estimation: 0 }
      }
    }
    cb(resp)
  })
}

const getAllEntries = async () => {
  isLoading.value = true
  await fetchEntries({ timeRange: [columns.value[0].props, columns.value[columns.value.length - 1].props] })
    .then((resp: EntryDO[]) => {
      if (!resp) {
        return
      }
      resp.forEach((entry) => {
        columns.value
          .filter((col) => col.props)
          .forEach((col) => {
            if (!entry.timelogs?.some((tl) => dayjs(tl.date).isSame(dayjs(col.props)))) {
              entry.timelogs?.push({ entry_id: entry.id, date: col.props, duration: 0 })
            }
          })

        entry.sum = entry.timelogs?.reduce((tl1, tl2) => tl1 + tl2.duration, 0)
      })

      entries.value = resp
    })
    .finally(() => {
      isLoading.value = false
    })
}

const fetchEntries = async (query?: EntryListQuery): Promise<EntryDO[]> => {
  return await window.api.queryEntries(query)
}

const onEntrySave = async () => {
  if (selectedRow.value) {
    await window.api.saveEntry([toRaw(selectedRow.value)]).then(async () => {
      await getAllEntries()
    })
  }
}

const isColumnToday = (col: { props: Date }): boolean => {
  return dayjs(col.props).isSame(dayjs(), 'day')
}

const copyAll = (type: string) => {
  let clipboard = ''
  if (type === 'entry-comma') {
    clipboard = entries.value.map((e) => e.label).join(',')
  } else if (type === 'all-table') {
    clipboard = entries.value
      .map((e) => {
        let tableArr = [e.label]

        if (e.timelogs) {
          tableArr = [...tableArr, ...e.timelogs.map((tl) => String(tl.duration))]
        }

        return tableArr.join('\t')
      })
      .join('\n')
  }

  navigator.clipboard.writeText(clipboard)
}
</script>

<template>
  <el-card class="mb-2">
    <el-form label-position="left" label-width="160px" @submit.prevent="addEntry">
      <el-form-item label="Label" required>
        <el-autocomplete
          v-model="searchEntry"
          :fetch-suggestions="queryAutoComplete"
          fit-input-width
          value-key="label"
          clearable
          class="w-100"
          @select="selectEntry"
        >
          <template #default="{ item }">
            <div class="w-100">{{ item.label }}</div>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-button :type="isNewEntry ? 'success' : 'primary'" @click="addEntry">
        {{ isNewEntry ? 'Add New' : 'Add' }}
      </el-button>
    </el-form>
  </el-card>

  <el-card class="mb-2">
    <el-button :type="isUnsavedChange ? `warning` : `success`" @click="saveAll">
      <ri-save3-line />
      <span v-if="isUnsavedChange">There are unsaved changes!</span>
    </el-button>

    <el-popover trigger="click" width="200px">
      <template #reference>
        <el-button>
          <ri-file-copy2-line />
        </el-button>
      </template>
      <div>
        <div>Copy As</div>
        <div class="copy-button" @click="() => copyAll('entry-comma')">separated by commas</div>
        <div class="copy-button" @click="() => copyAll('all-table')">as table</div>
      </div>
    </el-popover>

    <div class="float-right" style="display: inline-flex; align-items: center; gap: 4px">
      <el-button
        @click="
          () => {
            selectedDate = dayjs(selectedDate).subtract(1, 'week').toDate()
            getAllEntries()
          }
        "
        >&lt;</el-button
      >
      <el-date-picker
        v-model="selectedDate"
        type="week"
        format="[Week] ww, YYYY"
        @change="getAllEntries"
      ></el-date-picker>
      <el-button
        @click="
          () => {
            selectedDate = dayjs(selectedDate).add(1, 'week').toDate()
            getAllEntries()
          }
        "
        >&gt;</el-button
      >
    </div>
    <el-table
      v-model:data="entries"
      v-loading=""
      width="100%"
      show-summary
      :summary-method="getSumOfColumn"
      size="large"
      highlight-current-row
      :class="[{ 'dense-table': settings.timesheet.denseTable }, 'entry-table']"
      @current-change="selectRow"
    >
      <el-table-column label="Entry" prop="label" min-width="100px">
        <template #default="{ row }">
          <div>
            {{ row.label }}
            <el-tooltip v-if="row.estimation && row.totalDuration > row.estimation">
              <ri-error-warning-fill class="text-warning" />
              <template #content>
                Estimated time exceeded. ({{ row.totalDuration }}hr / {{ row.estimation }}hr)
              </template>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-for="col in columns"
        :key="col.label"
        :label="col.label"
        :prop="col.label"
        :width="settings.timesheet.denseTable ? '60px' : '80px'"
        :class-name="isColumnToday(col) ? 'today-col' : ''"
        :label-class-name="isColumnToday(col) ? 'today-col-header' : ''"
      >
        <template #default="scope">
          <template
            v-for="(timelog, i) in [scope.row?.timelogs?.find((val) => val.date.getTime() === col.props.getTime())]"
            :key="i"
          >
            <el-input
              v-if="timelog"
              :model-value="rawInputs[timelogKey(timelog)] ?? formatDuration(timelog.duration)"
              :class="{ 'filled-timelog': timelog.duration > 0 }"
              class="entry-input-number"
              @input="(val: string) => { rawInputs[timelogKey(timelog)] = val }"
              @change="(val: string) => { delete rawInputs[timelogKey(timelog)]; timelog.duration = parseDuration(val); setUnsavedChangeTrue() }"
              @keydown.enter="(e: Event) => { const v = (e.target as HTMLInputElement).value; delete rawInputs[timelogKey(timelog)]; timelog.duration = parseDuration(v); setUnsavedChangeTrue(); saveAll() }"
            />
          </template>
        </template>
      </el-table-column>

      <el-table-column prop="sum" label="SUM" width="90px">
        <template #default="{ row }">
          {{ formatDuration(row.sum) }}
        </template>
      </el-table-column>

      <el-table-column label="Timer" width="100px">
        <template #default="{ $index }">
          <timer-button v-if="isToday" v-model="entries[$index]" @add-duration="setUnsavedChangeTrue" />
        </template>
      </el-table-column>

      <el-table-column v-slot="scope" label="Actions" width="75px">
        <el-popconfirm
          title="This will only delete the time logs for this row"
          width="220px"
          @confirm="() => removeTimeLogs(scope.row)"
        >
          <template #reference>
            <iconoir-trash class="action-icon remove-icon clickable" />
          </template>
        </el-popconfirm>
      </el-table-column>
    </el-table>
  </el-card>

  <entry-overview v-model="selectedRow" @save="onEntrySave" @delete="removeEntry" />
</template>

<style scoped lang="less">
.action-icon {
  font-size: var(--el-font-size-medium);
  margin-left: 0.25rem;
  outline: none;
  &:first-child {
    margin-left: 0;
  }
}

.remove-icon {
  color: var(--el-color-error);
}

.copy-button {
  cursor: pointer;
  padding: 8px 15px;
  border-radius: var(--el-border-radius-base);

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

.entry-input-number {
  width: 100% !important;

  :deep(input) {
    text-align: center;
  }
}
</style>

<style lang="less">
.today-col {
  background-color: var(--el-fill-color-light) !important;
}

.today-col-header {
  background-color: var(--el-fill-color) !important;
  font-weight: 700 !important;
  color: var(--el-color-primary) !important;
}
</style>
