import { BaseDO, BaseEntity } from './BaseEntity'
import { Association, HasManyCreateAssociationMixin, NonAttribute } from 'sequelize'
import { EntryTimelog, EntryTimelogDO } from './EntryTimelog'

export class Entry extends BaseEntity<Entry> {
  declare label: string

  declare createTimelog: HasManyCreateAssociationMixin<EntryTimelog, 'entry_id'>
  declare timelogs?: NonAttribute<EntryTimelog[]>

  declare static associations: {
    timelogs: Association<Entry, EntryTimelog>
  }
}

export interface EntryDO extends BaseDO {
  label: string
  timelogs?: EntryTimelogDO[]
  sum?: number
  totalDuration?: number
}
