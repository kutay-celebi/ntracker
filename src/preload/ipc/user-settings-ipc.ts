import { ipcMain } from 'electron'
import { UserSettings } from '../db/types/UserSettings'

ipcMain.handle('db.user-settings.getSettings', async () => {
  const userSettings = await UserSettings.findAll()

  return userSettings.map((us) => us.get({ plain: true }))
})

ipcMain.handle('db.user-settings.save', async (_event, args: UserSettings) => {
  return await UserSettings.upsert({
    id: args.id ?? args.id,
    settingType: args.settingType,
    setting: args.setting,
    settingValue: args.settingValue
  })
})
