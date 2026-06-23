import { BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export interface TimerState {
  isRunning: boolean
  label: string
  elapsed: string
  elapsedSeconds: number
  entryId: string | undefined
}

let floatingWindow: BrowserWindow | null = null
let timerInterval: ReturnType<typeof setInterval> | null = null

let timerState: TimerState = {
  isRunning: false,
  label: '',
  elapsed: '0:00:00',
  elapsedSeconds: 0,
  entryId: undefined
}

let startedAtMs = 0
let baseElapsedMs = 0

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function broadcastState(): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send('timer.state', timerState)
    }
  }
}

function startTick(): void {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    const totalMs = baseElapsedMs + (Date.now() - startedAtMs)
    timerState.elapsedSeconds = Math.floor(totalMs / 1000)
    timerState.elapsed = formatElapsed(timerState.elapsedSeconds)
    broadcastState()
  }, 1000)
}

function stopTick(): void {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function ensureFloatingVisible(): void {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    floatingWindow = createFloatingWindow()
    floatingWindow.once('ready-to-show', () => {
      floatingWindow?.webContents.send('timer.state', timerState)
      floatingWindow?.show()
    })
  } else if (!floatingWindow.isVisible()) {
    floatingWindow.show()
    floatingWindow.webContents.send('timer.state', timerState)
  }
}

function createFloatingWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const win = new BrowserWindow({
    width: 280,
    height: 76,
    x: width - 300,
    y: height - 100,
    alwaysOnTop: true,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('closed', () => {
    floatingWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/floating.html`)
  } else {
    win.loadFile(join(__dirname, '../renderer/floating.html'))
  }

  return win
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

// Start timer for a given entry (always resets elapsed)
ipcMain.on('timer.start', (_event, payload: { label: string; entryId: string }) => {
  stopTick()
  baseElapsedMs = 0
  startedAtMs = Date.now()

  timerState.label = payload.label
  timerState.entryId = payload.entryId
  timerState.isRunning = true
  timerState.elapsedSeconds = 0
  timerState.elapsed = '0:00:00'

  startTick()
  broadcastState()
  ensureFloatingVisible()
})

// Pause the active timer
ipcMain.on('timer.pause', () => {
  if (!timerState.isRunning) return
  stopTick()
  baseElapsedMs += Date.now() - startedAtMs
  timerState.isRunning = false
  broadcastState()
})

// Resume a paused timer
ipcMain.on('timer.resume', () => {
  if (timerState.isRunning || timerState.elapsedSeconds === 0) return
  timerState.isRunning = true
  startedAtMs = Date.now()
  startTick()
  broadcastState()
  ensureFloatingVisible()
})

// Reset timer and close floating window
ipcMain.on('timer.reset', () => {
  stopTick()
  baseElapsedMs = 0
  startedAtMs = 0
  timerState = {
    isRunning: false,
    label: '',
    elapsed: '0:00:00',
    elapsedSeconds: 0,
    entryId: undefined
  }
  broadcastState()
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.close()
    floatingWindow = null
  }
})

// Pause + focus main window + ask renderer to open add-duration dialog
ipcMain.on('timer.requestAddDuration', () => {
  if (timerState.isRunning) {
    stopTick()
    baseElapsedMs += Date.now() - startedAtMs
    timerState.isRunning = false
    broadcastState()
  }

  const mainWindow = BrowserWindow.getAllWindows().find((w) => !w.isDestroyed() && w !== floatingWindow)
  if (mainWindow) {
    if (!mainWindow.isVisible()) mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('timer.openAddDurationDialog', timerState)
  }
})

// Hide floating window without stopping the timer
ipcMain.on('timer.floating.hide', () => {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.hide()
  }
})

// Return current timer state on demand (for window initialization)
ipcMain.handle('timer.getState', () => timerState)
