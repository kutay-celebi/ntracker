import { ipcMain } from 'electron'
import { Entry, EntryDO } from '../db/types/Entry'
import { EntryListQuery } from '../db/types/EntryListQuery'
import { EntryTimelog } from '../db/types/EntryTimelog'
import { InferAttributes, Op, WhereOptions } from 'sequelize'

ipcMain.handle('db.entry.insert', async (_event, args) => {
  const entries: EntryDO[] = JSON.parse(args)
  for (const obj of entries) {
    const saved = await Entry.upsert({ id: obj.id, label: obj.label })

    if (obj.timelogs) {
      for (const timelog of obj.timelogs) {
        await EntryTimelog.upsert({
          id: timelog.id,
          date: timelog.date,
          duration: timelog.duration,
          entry_id: saved[0].id
        })
      }
    }
  }
})

ipcMain.handle('db.entry.getEntries', async (_event, args: EntryListQuery) => {
  const where: WhereOptions<InferAttributes<Entry, { omit: never }>> = {}

  if (args.timeRange) {
    where['$timelogs.date$'] = {
      [Op.between]: args.timeRange
    }
  }

  if (args.label) {
    where['label'] = { [Op.substring]: args.label }
  }

  const entries = await Entry.findAll({
    where: where,
    include: [{ model: EntryTimelog, as: 'timelogs' }]
  })

  const mappedEntries: EntryDO[] = entries.map((e) => e.get({ plain: true }))
  return mappedEntries
})

ipcMain.handle('db.entry.removeById', async (_event, args: string) => {
  await Entry.destroy({
    cascade: true,
    where: {
      id: args
    }
  })
})
