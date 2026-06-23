import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Entry, EntryDO, EntryOverviewDO } from '@main/db/types/Entry'
import { EntryListQuery } from '@main/db/types/EntryListQuery'
import { EntryReportDO } from '@main/db/types/EntryReportDO'
import { TodoDO, TodoListQuery } from '@main/db/types/Todo'
import { NTrackerEnv } from '@main/env'
import { UpdateCheckResult } from 'electron-updater'
import { TimerState } from '@main/ipc/timer-ipc'

// Custom APIs for renderer
export const api = {
  saveEntry: (entries: EntryDO[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry.save', entries)
  },
  removeEntry: (id: string): Promise<void> => {
    ipcRenderer.send('db.entry.delete', id)
    return Promise.resolve()
  },
  queryEntries: (query?: EntryListQuery): Promise<Entry[]> => {
    return ipcRenderer.invoke('db.entry.queryEntries', query)
  },
  /**
   * @deprecated
   * @param id
   */
  getEntryReport: (id: string): Promise<EntryReportDO> => {
    return ipcRenderer.invoke('db.entry.getEntryReport', id)
  },
  getEntryOverview: (id: string): Promise<EntryOverviewDO> => {
    return ipcRenderer.invoke('db.entry.getEntryOverview', id)
  },
  removeTimelogsByIds: (ids: string[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry-timelog.removeTimeLogsByIds', ids)
  },
  getTodods: (query?: TodoListQuery): Promise<TodoDO[]> => {
    return ipcRenderer.invoke('db.todo.queryTodos', query)
  },
  saveTodo: (todo: TodoDO): Promise<TodoDO> => {
    return ipcRenderer.invoke('db.todo.save', todo)
  },
  removeTodo: (id: string): Promise<void> => {
    ipcRenderer.send('db.todo.delete', id)
    return Promise.resolve()
  },
  getAllSettings: (): Promise<any> => {
    return ipcRenderer.invoke('app.settings.getAllSettings')
  },
  getEnvs: (): Promise<NTrackerEnv> => {
    return ipcRenderer.invoke('app.settings.getEnvs')
  },
  saveSetting: (args: any): void => {
    ipcRenderer.send('app.settings.setSetting', args)
  },
  checkUpdates: (): Promise<UpdateCheckResult> => {
    return ipcRenderer.invoke('app.settings.checkUpdate')
  },
  downloadUpdate: (): void => {
    ipcRenderer.send('app.settings.downloadUpdate')
  },
  // ── Timer API ──────────────────────────────────────────────────────────────
  timerStart: (label: string, entryId: string): void => {
    ipcRenderer.send('timer.start', { label, entryId })
  },
  timerPause: (): void => {
    ipcRenderer.send('timer.pause')
  },
  timerResume: (): void => {
    ipcRenderer.send('timer.resume')
  },
  timerReset: (): void => {
    ipcRenderer.send('timer.reset')
  },
  timerRequestAddDuration: (): void => {
    ipcRenderer.send('timer.requestAddDuration')
  },
  timerHideFloating: (): void => {
    ipcRenderer.send('timer.floating.hide')
  },
  timerGetState: (): Promise<TimerState> => {
    return ipcRenderer.invoke('timer.getState')
  },
  onTimerState: (callback: (state: TimerState) => void): (() => void) => {
    const handler = (_event: unknown, state: TimerState): void => callback(state)
    ipcRenderer.on('timer.state', handler)
    return () => ipcRenderer.removeListener('timer.state', handler)
  },
  onTimerOpenDialog: (callback: (state: TimerState) => void): (() => void) => {
    const handler = (_event: unknown, state: TimerState): void => callback(state)
    ipcRenderer.on('timer.openAddDurationDialog', handler)
    return () => ipcRenderer.removeListener('timer.openAddDurationDialog', handler)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
