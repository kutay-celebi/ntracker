import { BaseDO, BaseEntity } from './BaseEntity'
import { ForeignKey, NonAttribute } from 'sequelize'
import { Entry } from './Entry'

export class EntryTimelog extends BaseEntity<EntryTimelog> {
  declare date: Date
  declare duration: number
  declare entry_id: ForeignKey<Entry['id']>

  declare entry?: NonAttribute<Entry>
}

export interface EntryTimelogDO extends BaseDO {
  date: Date
  duration: number
  entry_id?: string
}
