// @ts-ignore import json
import schema from './schema'
import type ElectronStore from 'electron-store'

export interface AppSettings {
  timesheet: {
    denseTable: boolean
    forceLabel: boolean
    onlyWeekDays: boolean
  }
}

let _store: ElectronStore<AppSettings> | null = null

export async function initStore(): Promise<void> {
  const { default: Store } = await import('electron-store')
  _store = new Store<AppSettings>({ schema, name: 'config' })
}

export function getStore(): ElectronStore<AppSettings> {
  if (!_store) throw new Error('Store not initialized. Call initStore() first.')
  return _store
}
