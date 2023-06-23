import { ipcMain, shell } from 'electron'
import log from 'electron-log'
import store from '../settings'
import { autoUpdater, UpdateCheckResult } from 'electron-updater'
import { nTrackerEnv } from '../env'

ipcMain.on('app.settings.setSetting', (_event, args) => {
  log.debug(`${args.key} is set to ${args.value}`)
  store.set(args.key, args.value)
})

ipcMain.handle('app.settings.getAllSettings', () => {
  return store.store
})

ipcMain.handle('app.settings.getEnvs', () => {
  return nTrackerEnv
})

ipcMain.handle('app.settings.checkUpdate', (): Promise<UpdateCheckResult | null> => {
  return autoUpdater.checkForUpdates()
})

ipcMain.on('app.settings.downloadUpdate', async (): Promise<void> => {
  await shell.openExternal('https://github.com/kutay-celebi/ntracker/releases/latest')
})
