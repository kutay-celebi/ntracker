import * as path from 'path'
import { DataTypes, Sequelize } from 'sequelize'
import fs from 'fs'
import { Entry } from './types/Entry'
import { EntryTimelog } from './types/EntryTimelog'
import { Todo } from './types/Todo'
import log from 'electron-log'
import { SequelizeStorage, Umzug } from 'umzug'
import { migration0001 } from './migrations/0001-add_col'
import { NTrackerEnv } from '../env'

let db
let umzug

export const initializeDB = async (appEnv: NTrackerEnv): Promise<void> => {
  const dbFilePath = path.join(appEnv.dbPath, 'db.sqlite3')
  if (!fs.existsSync(dbFilePath)) {
    log.info(`Creating database on path ${dbFilePath}`)
    fs.closeSync(fs.openSync(dbFilePath, 'w'))
  }

  db = new Sequelize({
    dialect: 'sqlite',
    storage: dbFilePath,
    define: {
      underscored: true
    }
  })
  await db.authenticate()

  Entry.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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

  Todo.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      label: {
        type: DataTypes.STRING
      },
      dueDate: {
        type: DataTypes.DATE
      },
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      sequelize: db,
      tableName: 'todo',
      freezeTableName: true,
      modelName: 'todo'
    }
  )

  // initialize table
  await Entry.sync().catch((err) => log.error(err))
  await EntryTimelog.sync().catch((err) => log.error(err))
  await Todo.sync().catch((err) => log.error(err))

  // migration
  umzug = new Umzug({
    migrations: [migration0001],
    context: db.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db }),
    logger: log
  })
  await umzug.up()
}
export default db
