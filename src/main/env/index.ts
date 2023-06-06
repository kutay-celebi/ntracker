import { app } from 'electron'
import * as path from 'path'

export interface NTrackerEnv {
  userPath: string
  appPath: string
  configPath: string
}

const setupEnv = (): NTrackerEnv => {
  const userData = app.getPath('userData')
  return {
    userPath: userData,
    configPath: path.join(userData, 'config'),
    appPath: app.getPath('appData')
  }
}
export default setupEnv
