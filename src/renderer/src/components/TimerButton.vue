<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import { useStopwatch } from 'vue-timer-hook'
import dayjs from 'dayjs'
import { EntryDO } from '../../../main/db/types/Entry'
import RiPlayCircleLine from '~icons/ri/play-circle-line'
import RiPauseCircleLine from '~icons/ri/pause-circle-line'
import RiStopCircleLine from '~icons/ri/stop-circle-line'

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

const currentDuration = ref()
const timer = useStopwatch(0, false)

const timerButtonText = computed(() => {
  return timer.days.value * 24 + timer.hours.value + ':' + timer.minutes.value + ':' + timer.seconds.value
})

watch(
  () => timer,
  (val) => {
    if (!val.isRunning.value) {
      return
    }
    if (val.hours.value === 0 && val.minutes.value == 0 && val.seconds.value === 0) {
      currentDuration.value = 0
    } else {
      currentDuration.value = val.days.value * 24 + val.hours.value + (Math.floor(val.minutes.value / 15) + 1) * 0.25
    }
  },
  {
    deep: true
  }
)

const toggleTimer = (): void => {
  if (timer.isRunning.value) {
    timer.pause()
  } else {
    timer.start()
  }
}

const resetTimer = (): void => {
  timer.reset(0, false)
  currentDuration.value = 0
}

const addDuration = () => {
  if (!internalModel.value || !internalModel.value.timelogs) {
    return
  }

  internalModel.value.timelogs.forEach((tl) => {
    if (dayjs(tl.date).isSame(dayjs().startOf('days'))) {
      tl.duration = tl.duration + currentDuration.value
    }
  })

  resetTimer()
  emits('addDuration')
}
</script>

<template>
  <div v-if="internalModel" class="timer">
    <ri-play-circle-line v-if="!timer.isRunning.value" class="timer-icon timer-play" @click.stop="toggleTimer" />
    <ri-pause-circle-line v-if="timer.isRunning.value" class="timer-icon timer-pause" @click.stop="toggleTimer" />
    <el-popconfirm v-if="currentDuration > 0" title="Do you want to add?" @confirm="addDuration" @cancel="resetTimer">
      <template #reference>
        <ri-stop-circle-line class="timer-icon timer-stop" @click.stop="toggleTimer" />
      </template>
    </el-popconfirm>
    {{ timerButtonText }}
  </div>
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
