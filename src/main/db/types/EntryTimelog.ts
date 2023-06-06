import { BaseDO, BaseEntity } from './BaseEntity'
import { Association, ForeignKey, HasManyGetAssociationsMixin, NonAttribute } from 'sequelize'
import { Entry } from './Entry'

export class EntryTimelog extends BaseEntity<EntryTimelog> {
  declare date: Date
  declare duration: number
  declare entry_id: ForeignKey<Entry['id']>

  declare getEntry: HasManyGetAssociationsMixin<Entry>
  declare entry?: NonAttribute<Entry>

  declare static associations: {
    entry: Association<Entry, EntryTimelog>
  }
}

export interface EntryTimelogDO extends BaseDO {
  date: Date
  duration: number
  entry_id?: string
}
