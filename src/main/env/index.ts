import { app } from 'electron'
import * as path from 'path'

export interface NTrackerEnv {
  userPath: string
  appPath: string
  configPath: string
  dbPath: string
}

const setupEnv = (): NTrackerEnv => {
  const userData = app.getPath('userData')
  return {
    userPath: userData,
    configPath: path.join(userData, 'config'),
    dbPath: path.join(userData),
    appPath: app.getPath('appData')
  }
}
export default setupEnv
