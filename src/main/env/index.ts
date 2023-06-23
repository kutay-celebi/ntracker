import { app } from 'electron'
import * as path from 'path'

export interface NTrackerEnv {
  userPath: string
  appPath: string
  configPath: string
  logFile: string
  dbPath: string
  isDev: boolean
  version: any
}

let nTrackerEnv: NTrackerEnv = {
  logFile: '',
  appPath: '',
  configPath: '',
  dbPath: '',
  isDev: true,
  userPath: '',
  version: undefined
}

const setupEnv = (): void => {
  const userData = app.getPath('userData')

  nTrackerEnv = {
    userPath: userData,
    configPath: path.join(userData, 'config'),
    dbPath: userData,
    logFile: path.join(userData, '/logs/app.log'),
    appPath: app.getPath('appData'),
    isDev: process.env.NODE_ENV === 'development',
    version: app.getVersion()
  }
}
export { setupEnv, nTrackerEnv }
