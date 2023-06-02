<script setup lang="ts">
import Timer from '@renderer/components/Timer.vue'
import EntryReport from '@renderer/components/EntryReport.vue'
import { computed, onMounted, ref, toRaw } from 'vue'
import { EntryDO } from '../../../preload/db/types/Entry'
import { EntryTimelogDO } from '../../../preload/db/types/EntryTimelog'
import IconoirSaveFloppyDisk from '~icons/iconoir/save-floppy-disk'
import IconoirTrash from '~icons/iconoir/trash'
import { EntryListQuery } from '../../../preload/db/types/EntryListQuery'
import dayjs from 'dayjs'

const entry = ref<EntryDO>({ label: '' })
const isUnsavedChange = ref(false)
const selectedDate = ref<Date>(new Date())

const searchEntry = ref('')
const entries = ref<EntryDO[]>([])

const selectedRow = ref<EntryDO>()

const columns = computed(() => {
  let date = dayjs(selectedDate.value).startOf('days').startOf('weeks')
  const cols: any[] = []
  for (let i = 0; i < 7; i++) {
    cols.push({ props: date.toDate(), label: date.format('DD - ddd') })
    date = date.add(1, 'days')
  }
  return cols
})

onMounted(async () => {
  await getAllEntries()
})

const addEntry = async () => {
  const timelogs: EntryTimelogDO[] = []
  entry.value.label = searchEntry.value

  let date = dayjs(selectedDate.value).startOf('weeks').startOf('days')
  for (let i = 0; i < 7; i++) {
    timelogs.push({ date: date.toDate(), duration: 0.0 })
    date = date.add(1, 'days')
  }

  entries.value.push({ ...entry.value, timelogs: timelogs })
  await saveAll()
}

const saveAll = async () => {
  await window.api.insertEntry(toRaw(entries.value)).then(async () => {
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

  const sums: string[] = []
  let startOf = dayjs(selectedDate.value).startOf('weeks').startOf('days')
  cols.forEach((column, index) => {
    if (index === 0) {
      sums[index] = 'SUM'
      return
    }
    if (index === cols.length - 1) {
      sums[index] = ''
      return
    }

    sums[index] = data
      .filter((entry) => entry.timelogs)
      .flatMap((entry) =>
        entry.timelogs.filter((tl) => dayjs(tl.date).startOf('days').isSame(startOf)).map((val) => val.duration)
      )
      .reduce((val1, val2) => val1 + val2, 0)

    startOf = startOf.add(1, 'days')
  })
  return sums
}

const removeTimeLogs = async (entry: EntryDO) => {
  if (!entry.timelogs) {
    return
  }

  const ids = entry.timelogs.map((tl) => tl.id)
  if (ids) {
    await window.api.removeTimeLogsByIds(ids as string[]).then(() => {
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

const fetchEntries = async (query?: EntryListQuery): Promise<EntryDO[]> => {
  return await window.api.getEntries(query)
}
</script>

<template>
  <el-card class="my-2">
    <el-form label-position="left" label-width="160px">
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
      <el-button @click="addEntry">Add</el-button>
    </el-form>
  </el-card>

  <timer v-model="selectedRow" @add-duration="setUnsavedChangeTrue" />

  <el-card class="my-2">
    <el-button :type="isUnsavedChange ? `warning` : `success`" @click="saveAll">
      <iconoir-save-floppy-disk />
      <span v-if="isUnsavedChange">There are unsaved changes!</span>
    </el-button>
    <el-date-picker v-model="selectedDate" class="float-right" @change="getAllEntries"></el-date-picker>
    <el-table
      v-model:data="entries"
      width="100%"
      show-summary
      :summary-method="getSumOfColumn"
      size="large"
      highlight-current-row
      @current-change="selectRow"
    >
      <el-table-column label="Entry" prop="label" />

      <el-table-column v-for="col in columns" :key="col.label" :label="col.label" :prop="col.label">
        <template #default="scope">
          <div>
            <el-input-number
              v-if="scope.row && scope.row.timelogs.find((val) => val.date.getTime() === col.props.getTime())"
              v-model="scope.row.timelogs.find((val) => val.date.getTime() === col.props.getTime()).duration"
              :controls="false"
              size="small"
              @input="setUnsavedChangeTrue"
            ></el-input-number>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="sum" label="SUM" />

      <el-table-column v-slot="scope" label="Actions">
        <el-icon color="red" class="clickable" @click="() => removeTimeLogs(scope.row)">
          <iconoir-trash />
        </el-icon>
      </el-table-column>
    </el-table>
  </el-card>

  <entry-report :entry="selectedRow" />
</template>

<style scoped lang="less"></style>
