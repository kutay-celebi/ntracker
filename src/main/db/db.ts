import * as path from 'path'
import { Sequelize } from 'sequelize'
import fs from 'fs'
import log from 'electron-log'
import { SequelizeStorage, Umzug } from 'umzug'
import { migration0001 } from './migrations/0001-add_col'
import { NTrackerEnv } from '../env'
import { seed } from './seed'

let db
let umzug

export const initializeDB = async (appEnv: NTrackerEnv): Promise<void> => {
  const dbFilePath = path.join(appEnv.dbPath, 'db.sqlite3')
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
    }
  })

  await db.authenticate()
  await seed(db)

  // migration
  umzug = new Umzug({
    migrations: [migration0001],
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
