import { defineStore } from 'pinia'
import { AppSettings } from '../../../main/settings'
import { toRaw } from 'vue'

export const useSettingsStore = defineStore({
  id: 'settings',
  state: () =>
    ({
      timesheet: {}
    } as AppSettings),
  actions: {
    async initSettings() {
      this.$state = await window.api.getAllSettings()
    },
    async saveSettings(key, val) {
      await window.api.saveSetting({ key, value: toRaw(val) })
      await this.initSettings()
    }
  }
})
