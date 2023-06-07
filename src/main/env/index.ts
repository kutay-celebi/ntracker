import { app } from 'electron'
import * as path from 'path'

export interface NTrackerEnv {
  userPath: string
  appPath: string
  configPath: string
  logFile: string
  dbPath: string
  isDev: boolean
}

export const env: NTrackerEnv = { logFile: '', appPath: '', configPath: '', dbPath: '', isDev: true, userPath: '' }

const setupEnv = (): NTrackerEnv => {
  const userData = app.getPath('userData')
  return {
    userPath: userData,
    configPath: path.join(userData, 'config'),
    dbPath: userData,
    logFile: path.join(userData, '/logs/app.log'),
    appPath: app.getPath('appData'),
    isDev: process.env.NODE_ENV === 'development'
  }
}
export default setupEnv
