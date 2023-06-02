import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Entry, EntryDO } from './db/types/Entry'
import { EntryListQuery } from './db/types/EntryListQuery'
import { EntryReportDO } from './db/types/EntryReportDO'
import { TodoDO, TodoListQuery } from './db/types/Todo'

// Custom APIs for renderer
export const api = {
  insertEntry: (entries: EntryDO[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry.insert', entries)
  },
  getEntries: (query?: EntryListQuery): Promise<Entry[]> => {
    return ipcRenderer.invoke('db.entry.getEntries', query)
  },
  removeEntry: (id: string): Promise<void> => {
    return ipcRenderer.invoke('db.entry.removeById', id)
  },
  removeTimeLogsByIds: (ids: string[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry.removeTimeLogsByIds', ids)
  },
  getEntryReport: (id: string): Promise<EntryReportDO> => {
    return ipcRenderer.invoke('db.entry.getEntryReport', id)
  },
  getTodods: (query?: TodoListQuery): Promise<TodoDO[]> => {
    return ipcRenderer.invoke('db.todo.getTodos', query)
  },
  saveTodo: (todo: TodoDO): Promise<TodoDO> => {
    return ipcRenderer.invoke('db.todo.saveTodo', todo)
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
