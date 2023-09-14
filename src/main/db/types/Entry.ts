import { BaseDO, BaseEntity } from './BaseEntity'
import { NonAttribute } from 'sequelize'
import { EntryTimelog, EntryTimelogDO } from './EntryTimelog'

export class Entry extends BaseEntity<Entry> {
  declare label: string
  declare notes?: string
  declare estimation: number

  declare timelogs?: NonAttribute<EntryTimelog[]>
}

export interface EntryDO extends BaseDO {
  label: string
  notes?: string
  timelogs?: EntryTimelogDO[]
  sum?: number
  totalDuration?: number
  estimation?: number
}

export type EntryOverviewDO = {
  id: string
  label: string
  notes: string | undefined
  estimation: number
  spent: number
}
