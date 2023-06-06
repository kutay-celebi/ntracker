import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Entry, EntryDO } from '../main/db/types/Entry'
import { EntryListQuery } from '../main/db/types/EntryListQuery'
import { EntryReportDO } from '../main/db/types/EntryReportDO'
import { TodoDO, TodoListQuery } from '../main/db/types/Todo'

// Custom APIs for renderer
export const api = {
  saveEntry: (entries: EntryDO[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry.save', entries)
  },
  queryEntries: (query?: EntryListQuery): Promise<Entry[]> => {
    return ipcRenderer.invoke('db.entry.queryEntries', query)
  },
  getEntryReport: (id: string): Promise<EntryReportDO> => {
    return ipcRenderer.invoke('db.entry.getEntryReport', id)
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
  getAllSettings: (): Promise<any> => {
    return ipcRenderer.invoke('app.settings.getAllSettings')
  },
  saveSetting: (args: any): void => {
    ipcRenderer.send('app.settings.setSetting', args)
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
