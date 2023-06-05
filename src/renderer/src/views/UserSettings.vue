<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue'
import { UserSettingsDO } from '../../../preload/db/types/UserSettings'

const settings = ref<UserSettingsDO[]>()

const getHumanReadable = (setting: string): string => {
  switch (setting) {
    case 'DENSE_TABLE':
      return 'Show the Entry table dense.'
    case 'FORCE_LABEL':
      return 'Force entry input label.'
    case 'ONLY_WEEK_DAYS':
      return 'Show only week days'
  }
  return ''
}

const onChangeSwitch = (row: UserSettingsDO) => {
  window.api.saveUserSettings(toRaw(row))
}

onMounted(async () => {
  window.api.getUserSettings().then((resp) => (settings.value = resp))
})
</script>

<template>
  <el-card>
    <el-table :data="settings">
      <el-table-column prop="setting" label="Setting" width="350px">
        <template #default="{ row }">
          {{ getHumanReadable(row.setting) }}
        </template>
      </el-table-column>
      <el-table-column>
        <template #default="{ row }">
          <el-switch
            v-model="row.settingValue"
            active-value="true"
            inactive-value="false"
            @change="() => onChangeSwitch(row)"
          />
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<style scoped lang="less"></style>
