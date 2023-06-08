<script setup lang="ts">
import EntryReport from '@renderer/components/EntryReport.vue'
import { computed, onMounted, ref, toRaw } from 'vue'
import { EntryDO } from '../../../main/db/types/Entry'
import { EntryTimelogDO } from '../../../main/db/types/EntryTimelog'
import IconoirSaveFloppyDisk from '~icons/iconoir/save-floppy-disk'
import IconoirTrash from '~icons/iconoir/trash'
import { EntryListQuery } from '../../../main/db/types/EntryListQuery'
import dayjs from 'dayjs'
import { useSettingsStore } from '@renderer/store/settigs'
import MarkdownRenderer from '@renderer/components/MarkdownRenderer.vue'
import IconoirPageEdit from '~icons/iconoir/page-edit'
import TimerButton from '@renderer/components/TimerButton.vue'
import RiFileCopy2Line from '~icons/ri/file-copy-2-line'

const settings = useSettingsStore()

const entry = ref<EntryDO>({ label: '', notes: '' })
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

const addEntry = async () => {
  if (entries.value.some((e) => e.id === entry.value.id || searchEntry.value === e.label)) {
    return
  }

  const timelogs: EntryTimelogDO[] = []
  entry.value.label = searchEntry.value.trim()

  let date = dayjs(selectedDate.value).startOf('weeks').startOf('days')
  for (let i = 0; i < 7; i++) {
    timelogs.push({ date: date.toDate(), duration: 0.0 })
    date = date.add(1, 'days')
  }

  entries.value.push({ ...entry.value, timelogs: timelogs })
  await saveAll()
}

const saveAll = async () => {
  await window.api.saveEntry(toRaw(entries.value)).then(async () => {
    isUnsavedChange.value = false
    await getAllEntries()
    searchEntry.value = ''
    entry.value = { label: '' }
  })
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
  selectedRow.value = val
}

const setUnsavedChangeTrue = () => {
  isUnsavedChange.value = true
}

const selectEntry = async (item: EntryDO) => {
  entry.value = item
}

const queryAutoComplete = async (text: string, cb: any) => {
  await fetchEntries({ label: text }).then((resp) => {
    if (settings.timesheet.forceLabel) {
      const toBeSelected = resp.find((entry) => entry.label.toLowerCase() === text.trim().toLowerCase())
      if (toBeSelected) {
        selectEntry(toBeSelected)
      } else {
        entry.value = { label: '' }
      }
    }
    cb(resp)
  })
}

const getAllEntries = async () => {
  entries.value = []
  await fetchEntries({ timeRange: [columns.value[0].props, columns.value[columns.value.length - 1].props] }).then(
    (resp: EntryDO[]) => {
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
    }
  )
}

const showDetail = ref(false)
const openDetail = () => {
  showDetail.value = true
}

const onNoteSave = () => {
  saveAll()
}

const fetchEntries = async (query?: EntryListQuery): Promise<EntryDO[]> => {
  return await window.api.queryEntries(query)
}

const copyAll = (type: string) => {
  let clipboard
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
  <el-card class="my-2">
    <el-form label-position="left" label-width="160px" @submit.prevent="addEntry">
      <el-form-item label="Label" required>
        <el-autocomplete
          v-model="searchEntry"
          :fetch-suggestions="queryAutoComplete"
          fit-input-width
          value-key="label"
          class="w-100"
          @select="selectEntry"
        >
          <template #default="{ item }">
            <div class="value">{{ item.label }}</div>
          </template>
        </el-autocomplete>
      </el-form-item>

      <el-form-item label="Notes">
        <el-input
          v-model="entry.notes"
          type="textarea"
          resize="vertical"
          placeholder="Markdown is available"
        ></el-input>
      </el-form-item>
      <el-button @click="addEntry">Add</el-button>
    </el-form>
  </el-card>

  <el-card class="my-2">
    <el-button :type="isUnsavedChange ? `warning` : `success`" @click="saveAll">
      <iconoir-save-floppy-disk />
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

    <el-date-picker v-model="selectedDate" class="float-right" @change="getAllEntries"></el-date-picker>
    <el-table
      v-model:data="entries"
      width="100%"
      show-summary
      :summary-method="getSumOfColumn"
      size="large"
      highlight-current-row
      :class="[{ 'dense-table': settings.timesheet.denseTable }, 'entry-table']"
      @current-change="selectRow"
    >
      <el-table-column label="Entry" prop="label" min-width="100px" />

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
              @input="setUnsavedChangeTrue"
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
        <iconoir-page-edit class="action-icon clickable" @click="() => openDetail()" />
      </el-table-column>
    </el-table>
  </el-card>

  <entry-report :entry="selectedRow" />
  <el-dialog v-model="showDetail" width="80%" @close="onNoteSave">
    <el-card v-if="selectedRow" class="entry-notes" header="Notes" shadow="never">
      <el-input v-model="selectedRow.notes" type="textarea" rows="20" class="notes-input"></el-input>
      <markdown-renderer :markdown="selectedRow.notes" class="notes-preview"> </markdown-renderer>
    </el-card>
  </el-dialog>
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
</style>
