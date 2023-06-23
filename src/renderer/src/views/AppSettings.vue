<script setup lang="ts">
import { useSettingsStore } from '@renderer/store/settigs'
import { UpdateCheckResult, UpdateInfo } from 'electron-updater'
import { ref } from 'vue'

const settings = useSettingsStore()
const updateInfo = ref<UpdateInfo>()
const showUpdateDialog = ref<boolean>(false)
const isNewUpdateExists = ref(false)

const getHumanReadable = (key: string): string => {
  switch (key) {
    case 'denseTable':
      return 'Show the Entry table dense.'
    case 'forceLabel':
      return 'Force to select entry when exact match'
    case 'onlyWeekDays':
      return 'Show only week days'
  }
  return ''
}

const onChangeSwitch = (key, val) => {
  settings.saveSettings(key, val)
}

const checkUpdates = async () => {
  await window.api.checkUpdates().then(async (resp: UpdateCheckResult) => {
    await window.api.getEnvs().then((env) => {
      showUpdateDialog.value = env.version !== resp.updateInfo.version
      isNewUpdateExists.value = !showUpdateDialog.value
      updateInfo.value = resp.updateInfo
    })
  })
}

const downloadUpdate = () => {
  window.api.downloadUpdate()
}
</script>

<template>
  <el-card>
    <el-form v-if="settings.timesheet" label-position="top">
      <el-form-item v-for="(_val, key, idx) in settings.timesheet" :key="idx" :label="getHumanReadable(key)">
        <el-switch v-model="settings.timesheet[key]" @change="() => onChangeSwitch('timesheet', settings.timesheet)" />
      </el-form-item>
    </el-form>
    <el-button @click="checkUpdates">{{ isNewUpdateExists ? 'NTrack is up to date' : 'Check Update' }}</el-button>

    <el-dialog v-model="showUpdateDialog" title="New version is available">
      <div v-if="updateInfo">
        <div v-html="updateInfo.releaseNotes"></div>
        <el-button @click="downloadUpdate">Download</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<style scoped lang="less"></style>
