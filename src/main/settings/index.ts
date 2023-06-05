import Store from 'electron-store'
// @ts-ignore import json
import schema from './schema'
// @ts-ignore import json
import { NTrackerEnv } from '../env'
import log from 'electron-log'
import { ipcMain } from 'electron'

export interface AppSettings {
  timesheet: {
    denseTable: boolean
    forceLabel: boolean
    onlyWeekDays: boolean
  }
}

const initializeSettings = (env: NTrackerEnv): typeof initializeSettings => {
  log.info(`Config is initializing on . ${env.configPath}`)
  const store = new Store({ schema, name: 'config' })

  ipcMain.on('app.settings.setSetting', (_event, args) => {
    log.debug(`${args.key} is set to ${args.value}`)
    store.set(args.key, args.value)
  })

  ipcMain.handle('app.settings.getAllSettings', () => {
    return store.store
  })
}

export default initializeSettings
