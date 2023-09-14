<script setup lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue'
import { EntryDO } from '@main/db/types/Entry'
import { EntryTimelogDO } from '@main/db/types/EntryTimelog'
import RiSave3Line from '~icons/ri/save-3-line'
import IconoirTrash from '~icons/iconoir/trash'
import { EntryListQuery } from '@main/db/types/EntryListQuery'
import dayjs from 'dayjs'
import { useSettingsStore } from '@renderer/store/settigs'
import TimerButton from '@renderer/components/TimerButton.vue'
import RiFileCopy2Line from '~icons/ri/file-copy-2-line'
import RiDeleteBin5Line from '~icons/ri/delete-bin-5-line'
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

const isToday = computed(() => dayjs(selectedDate.value).startOf('days').isSame(dayjs().startOf('days')))

onMounted(async () => {
  await getAllEntries()
})

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
    sums[index] = rowSum
    total += rowSum

    startOf = startOf.add(1, 'days')
  })

  sums[sums.length - 3] = total

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

    <el-popconfirm title="It will delete entire entry." width="fit-content" @confirm="removeEntry">
      <template #reference>
        <el-button type="danger" :disabled="!selectedRow">
          <ri-delete-bin5-line class="mr-2" />
          <span>Delete Entry</span>
        </el-button>
      </template>
    </el-popconfirm>

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

    <el-date-picker v-model="selectedDate" class="float-right" @change="getAllEntries"></el-date-picker>
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
        :width="settings.timesheet.denseTable ? '50px' : '80px'"
      >
        <template #default="scope">
          <div>
            <el-input-number
              v-if="scope.row && scope.row.timelogs.find((val) => val.date.getTime() === col.props.getTime())"
              v-model="scope.row.timelogs.find((val) => val.date.getTime() === col.props.getTime()).duration"
              :class="[
                {
                  'filled-timelog':
                    scope.row.timelogs.find((val) => val.date.getTime() === col.props.getTime()).duration > 0
                }
              ]"
              :controls="false"
              size="small"
              :max="24"
              :min="0"
              class="entry-input-number"
              @input="setUnsavedChangeTrue"
              @keydown.enter="saveAll"
            ></el-input-number>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="sum" label="SUM" width="50px" />

      <el-table-column label="Timer" width="100px">
        <template #default="{ $index }">
          <timer-button v-if="isToday" v-model="entries[$index]" @add-duration="setUnsavedChangeTrue" />
        </template>
      </el-table-column>

      <el-table-column v-slot="scope" label="Actions" width="75px">
        <el-popconfirm title="Are you sure?" @confirm="() => removeTimeLogs(scope.row)">
          <template #reference>
            <iconoir-trash class="action-icon remove-icon clickable" />
          </template>
        </el-popconfirm>
      </el-table-column>
    </el-table>
  </el-card>

  <entry-overview v-model="selectedRow" @save="onEntrySave" />
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
}
</style>
