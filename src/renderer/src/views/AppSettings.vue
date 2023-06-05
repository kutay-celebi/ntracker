<script setup lang="ts">
import { useSettingsStore } from '@renderer/store/settigs'

const settings = useSettingsStore()

const getHumanReadable = (key: string): string => {
  switch (key) {
    case 'denseTable':
      return 'Show the Entry table dense.'
    case 'forceLabel':
      return 'Force entry input label.'
    case 'onlyWeekDays':
      return 'Show only week days'
  }
  return ''
}

const onChangeSwitch = (key, val) => {
  settings.saveSettings(key, val)
}
</script>

<template>
  <el-card>
    <el-form v-if="settings.timesheet" label-position="left">
      <el-form-item
        v-for="(_val, key, idx) in settings.timesheet"
        :key="idx"
        :label="getHumanReadable(key)"
        label-width="200"
      >
        <el-switch v-model="settings.timesheet[key]" @change="() => onChangeSwitch('timesheet', settings.timesheet)" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped lang="less"></style>
