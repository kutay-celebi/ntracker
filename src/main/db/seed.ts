import { DataTypes, Sequelize } from 'sequelize'
import { Entry } from './types/Entry'
import { EntryTimelog } from './types/EntryTimelog'
import { Todo } from './types/Todo'
import log from 'electron-log'

export const seed = async (db: Sequelize): Promise<void> => {
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
      },
      notes: {
        type: DataTypes.STRING
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

  Entry.hasMany(EntryTimelog, {
    as: 'timelogs',
    onDelete: 'CASCADE',
    hooks: true,
    foreignKey: 'entry_id'
  })
  EntryTimelog.belongsTo(Entry, {
    foreignKey: 'entry_id'
  })

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
}
