<script setup lang="ts">
import { computed, onMounted, onUnmounted, PropType, ref } from 'vue'
import dayjs from 'dayjs'
import { EntryDO } from '../../../main/db/types/Entry'
import RiPlayCircleLine from '~icons/ri/play-circle-line'
import RiPauseCircleLine from '~icons/ri/pause-circle-line'
import RiStopCircleLine from '~icons/ri/stop-circle-line'

interface TimerState {
  isRunning: boolean
  label: string
  elapsed: string
  elapsedSeconds: number
  entryId: string | undefined
}

const emits = defineEmits(['update:modelValue', 'addDuration'])
const props = defineProps({
  modelValue: {
    type: null as unknown as PropType<EntryDO | undefined>,
    required: true
  }
})

const internalModel = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  }
})

// ── Timer state received from main process ────────────────────────────────────
const timerState = ref<TimerState>({
  isRunning: false,
  label: '',
  elapsed: '0:00:00',
  elapsedSeconds: 0,
  entryId: undefined
})

const isMyTimer = computed(() => !!props.modelValue?.id && timerState.value.entryId === props.modelValue.id)
const isRunning = computed(() => isMyTimer.value && timerState.value.isRunning)
const hasDuration = computed(() => isMyTimer.value && timerState.value.elapsedSeconds > 0)
const displayElapsed = computed(() => (isMyTimer.value ? timerState.value.elapsed : '0:00:00'))
// Hide timer controls for other rows when any timer is active
const isOtherTimerActive = computed(() => timerState.value.entryId !== undefined && !isMyTimer.value)

const currentDuration = computed(() => {
  if (!isMyTimer.value) return 0
  return Math.ceil(timerState.value.elapsedSeconds / 60) / 60
})

// ── Dialog state ──────────────────────────────────────────────────────────────
const dialogVisible = ref(false)
const selectedTargetDateTs = ref<number>(dayjs().startOf('days').valueOf())
const editableDuration = ref<string>('')

const availableDates = computed(() => {
  if (!internalModel.value?.timelogs) return []
  return internalModel.value.timelogs.map((tl) => ({
    label: dayjs(tl.date).format('ddd, DD MMM'),
    value: dayjs(tl.date).startOf('days').valueOf()
  }))
})

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

// ── Timer controls ────────────────────────────────────────────────────────────
const toggleTimer = (): void => {
  if (!props.modelValue?.id) return
  if (isRunning.value) {
    window.api.timerPause()
  } else if (isMyTimer.value) {
    window.api.timerResume()
  } else {
    window.api.timerStart(props.modelValue.label, props.modelValue.id)
  }
}

const openAddDialog = (): void => {
  if (!isMyTimer.value || timerState.value.elapsedSeconds === 0) return
  if (timerState.value.isRunning) {
    window.api.timerPause()
  }
  editableDuration.value = formatDuration(currentDuration.value)
  const todayTs = dayjs().startOf('days').valueOf()
  const dates = availableDates.value.map((d) => d.value)
  selectedTargetDateTs.value = dates.includes(todayTs) ? todayTs : dates[0] ?? todayTs
  dialogVisible.value = true
}

const confirmAdd = (): void => {
  if (!internalModel.value || !internalModel.value.timelogs) return
  const duration = parseDuration(editableDuration.value)
  internalModel.value.timelogs.forEach((tl) => {
    if (dayjs(tl.date).startOf('days').valueOf() === selectedTargetDateTs.value) {
      tl.duration = tl.duration + duration
    }
  })
  window.api.timerReset()
  dialogVisible.value = false
  emits('addDuration')
}

const cancelAdd = (): void => {
  window.api.timerReset()
  dialogVisible.value = false
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
let unsubState: (() => void) | null = null
let unsubDialog: (() => void) | null = null

onMounted(async () => {
  timerState.value = await window.api.timerGetState()
  unsubState = window.api.onTimerState((s) => {
    timerState.value = s
  })
  unsubDialog = window.api.onTimerOpenDialog((s) => {
    if (s.entryId === props.modelValue?.id) {
      openAddDialog()
    }
  })
})

onUnmounted(() => {
  unsubState?.()
  unsubDialog?.()
})
</script>

<template>
  <div v-if="internalModel && !isOtherTimerActive" class="timer">
    <ri-play-circle-line v-if="!isRunning" class="timer-icon timer-play" @click.stop="toggleTimer" />
    <ri-pause-circle-line v-if="isRunning" class="timer-icon timer-pause" @click.stop="toggleTimer" />
    <ri-stop-circle-line v-if="hasDuration || isRunning" class="timer-icon timer-stop" @click.stop="openAddDialog" />
    {{ displayElapsed }}
  </div>

  <el-dialog v-model="dialogVisible" title="Add Duration" width="360px" :close-on-click-modal="false" append-to-body>
    <el-form label-position="top">
      <el-form-item label="Day">
        <el-select v-model="selectedTargetDateTs" style="width: 100%">
          <el-option v-for="opt in availableDates" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="Duration (h:mm)">
        <el-input v-model="editableDuration" style="width: 100%" placeholder="e.g. 1:30" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="cancelAdd">Cancel</el-button>
      <el-button type="primary" @click="confirmAdd">Add</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="less">
.timer {
  display: flex;
  align-items: center;
}

.timer-icon {
  font-size: var(--el-font-size-medium);
  cursor: pointer;
}

.timer-play {
  color: var(--el-color-success);
}
.timer-pause {
  color: var(--el-color-warning);
}
.timer-stop {
  outline: 0 !important;
  color: var(--el-color-error);
}
</style>
