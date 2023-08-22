import * as path from 'path'
import { Sequelize } from 'sequelize'
import fs from 'fs'
import log from 'electron-log'
import { SequelizeStorage, Umzug } from 'umzug'
import { migration0001 } from './migrations/0001-add_col'
import { nTrackerEnv } from '../env'
import { seed } from './seed'
import { migration0002 } from './migrations/0002-add_estimation'

let db
let umzug

export const initializeDB = async (): Promise<void> => {
  const dbFilePath = path.join(nTrackerEnv.dbPath, 'db.sqlite3')
  const isDbExist = fs.existsSync(dbFilePath)
  if (!isDbExist) {
    log.info(`Creating database on path ${dbFilePath}`)
    fs.closeSync(fs.openSync(dbFilePath, 'w'))
  }

  db = new Sequelize({
    dialect: 'sqlite',
    storage: dbFilePath,
    define: {
      underscored: true
    },
    logging: nTrackerEnv.isDev
  })

  await db.authenticate()
  await seed(db)

  // migration
  umzug = new Umzug({
    migrations: [migration0001, migration0002],
    context: db.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: db }),
    logger: log
  })
  await umzug.up()
}
export default {
  db,
  umzug
}
