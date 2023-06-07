import { app, BrowserWindow, screen, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import './ipc'
import './db'
import { initializeDB } from './db/db'
import setupEnv from './env'
import initializeSettings from './settings'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import fs from 'fs'

async function createWindow(): Promise<void> {
  const appEnv = setupEnv()

  // clear log  files
  if (fs.existsSync(appEnv.logFile)) {
    fs.writeFileSync(appEnv.logFile, '')
    log.info(`Existing log file is cleared at ${appEnv.logFile}`)
  }

  // adjust logging
  log.transports.file.level = 'info'
  log.transports.file.resolvePath = (): string => appEnv.logFile

  await initializeDB(appEnv)
  initializeSettings(appEnv)

  const display = screen.getPrimaryDisplay()
  const size = display.size
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: Math.round(size.width * 0.75),
    height: Math.round(size.height * 0.8),
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    },
    title: 'Time Tracker'
  })

  mainWindow.setMenuBarVisibility(false)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  if (process.env.NODE_ENV === 'development') {
    autoUpdater.autoInstallOnAppQuit = false
    autoUpdater.autoDownload = false
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.updateConfigPath = 'dev-app-update.yml'
  }

  // todo @kcelebi currently signed app can not be updated automatically.
  // await autoUpdater.checkForUpdates()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  log.info('Update available:', info)
})

autoUpdater.on('update-not-available', () => {
  log.info('Update not available')
})

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater:', err)
})

autoUpdater.on('update-downloaded', (info) => {
  log.info('Update downloaded', info)
  autoUpdater.quitAndInstall()
})
