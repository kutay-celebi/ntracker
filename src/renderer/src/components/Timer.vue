<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue'
import { useStopwatch } from 'vue-timer-hook'
import dayjs from 'dayjs'
import { EntryDO } from '../../../preload/db/types/Entry'

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

const timerColor = computed(() => {
  return timer.isRunning.value ? 'warning' : 'success'
})

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
  <el-card class="my-2">
    <div v-if="internalModel">
      <el-button :type="timerColor" @click="toggleTimer">
        <div class="mr-2" style="min-width: 3rem">
          {{ timerButtonText }}
        </div>
        {{ timer.isRunning.value ? 'Pause' : 'Start' }}
      </el-button>
      <el-button @click="resetTimer"> Reset </el-button>
      <el-divider direction="vertical" />
      Duration: {{ currentDuration }}
      <el-divider direction="vertical" />
      <el-button @click="addDuration">
        {{ `Add to ` }}
        <span class="pl-1 font-weight-bold">{{ internalModel.label }}</span>
      </el-button>
    </div>
    <el-alert v-else show-icon type="info" :closable="false" effect="dark"> Select row first. </el-alert>
  </el-card>
</template>

<style scoped lang="less"></style>
