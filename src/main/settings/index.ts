import Store from 'electron-store'
// @ts-ignore import json
import schema from './schema'

export interface AppSettings {
  timesheet: {
    denseTable: boolean
    forceLabel: boolean
    onlyWeekDays: boolean
  }
}

const store = new Store({ schema, name: 'config' })
export default store
