<script setup lang="ts">
import { useSettingsStore } from '@renderer/store/settigs'
import { UpdateCheckResult, UpdateInfo } from 'electron-updater'
import { ref, onMounted } from 'vue'

const settings = useSettingsStore()
const updateInfo = ref<UpdateInfo>()
const showUpdateDialog = ref<boolean>(false)
const isUpToDate = ref(false)
const currentVersion = ref<string>('')
const isChecking = ref(false)

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

const onChangeSwitch = (key: string, val: any) => {
  settings.saveSettings(key, val)
}

onMounted(async () => {
  const env = await window.api.getEnvs()
  currentVersion.value = env.version
})

const checkUpdates = async () => {
  isChecking.value = true
  try {
    await window.api.checkUpdates().then(async (resp: UpdateCheckResult) => {
      await window.api.getEnvs().then((env) => {
        const hasNewVersion = env.version !== resp.updateInfo.version
        showUpdateDialog.value = hasNewVersion
        isUpToDate.value = !hasNewVersion
        updateInfo.value = resp.updateInfo
      })
    })
  } finally {
    isChecking.value = false
  }
}

const downloadUpdate = () => {
  window.api.downloadUpdate()
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <el-card>
      <template #header>
        <span>Settings</span>
      </template>
      <el-form v-if="settings.timesheet" label-position="top">
        <el-form-item v-for="(_val, key, idx) in settings.timesheet" :key="idx" :label="getHumanReadable(key)">
          <el-switch
            v-model="settings.timesheet[key]"
            @change="() => onChangeSwitch('timesheet', settings.timesheet)"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <span>Updates</span>
      </template>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Current Version"> v{{ currentVersion }} </el-descriptions-item>
          <el-descriptions-item label="Latest Version">
            <span v-if="updateInfo">v{{ updateInfo.version }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div style="display: flex; align-items: center; gap: 8px">
          <el-button :loading="isChecking" @click="checkUpdates">Check for Updates</el-button>
          <el-tag v-if="isUpToDate" type="success">Up to date</el-tag>
          <el-tag v-else-if="updateInfo && !isUpToDate" type="warning">New version available</el-tag>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="showUpdateDialog" title="New version is available">
      <div v-if="updateInfo">
        <div v-html="updateInfo.releaseNotes"></div>
        <el-button @click="downloadUpdate">Download</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="less"></style>
