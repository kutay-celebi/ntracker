import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Entry } from './db/types/Entry'
import { EntryListQuery } from './db/types/EntryListQuery'

// Custom APIs for renderer
const api = {
  insertEntry: (entries: Entry[]): Promise<void> => {
    return ipcRenderer.invoke('db.entry.insert', entries)
  },
  getEntries: (query: EntryListQuery): Promise<Entry[]> => {
    return ipcRenderer.invoke('db.entry.getEntries', query)
  },
  removeEntry: (id: string): Promise<void> => {
    return ipcRenderer.invoke('db.entry.removeById', id)
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
