import { homedir } from 'os'
import * as path from 'path'
import { DataTypes, Sequelize } from 'sequelize'
import fs from 'fs'
import { Entry } from './types/Entry'
import { EntryTimelog } from './types/EntryTimelog'

const dbFilePath = path.join(homedir(), 'timetracker', 'storage.sqlite3')

if (!fs.existsSync(path.join(homedir(), 'timetracker'))) {
  fs.mkdirSync(path.join(homedir(), 'timetracker'))
}

if (!fs.existsSync(dbFilePath)) {
  fs.closeSync(fs.openSync(dbFilePath, 'w'))
}
const db = new Sequelize({
  dialect: 'sqlite',
  storage: dbFilePath
})

export const initializeDB = async (): Promise<void> => {
  await db.authenticate()
  // await db.drop({ cascade: true })

  Entry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    { sequelize: db, tableName: 'entry', modelName: 'entry' }
  )

  EntryTimelog.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      date: {
        type: DataTypes.DATE,
        allowNull: false
      },
      duration: {
        type: DataTypes.FLOAT,
        defaultValue: 0
      }
    },
    { sequelize: db, tableName: 'entry_timelog', freezeTableName: true, modelName: 'entry_timelog' }
  )

  Entry.hasMany(EntryTimelog, { foreignKey: 'entry_id', as: 'timelogs' })
  EntryTimelog.belongsTo(Entry, { foreignKey: 'entry_id' })

  await Entry.sync()
  await EntryTimelog.sync()
}
export default db
