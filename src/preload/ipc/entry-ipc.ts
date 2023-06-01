import { ipcMain } from 'electron'
import { Entry, EntryDO } from '../db/types/Entry'
import { EntryListQuery } from '../db/types/EntryListQuery'
import { EntryReportDO } from '../db/types/EntryReportDO'
import { EntryTimelog } from '../db/types/EntryTimelog'
import { InferAttributes, Op, WhereOptions } from 'sequelize'
import dayjs from 'dayjs'

ipcMain.handle('db.entry.insert', async (_event, args) => {
  for (const obj of args) {
    const saved = await Entry.upsert({ id: obj.id, label: obj.label })

    if (obj.timelogs) {
      for (const timelog of obj.timelogs) {
        await EntryTimelog.upsert({
          id: timelog.id,
          date: timelog.date,
          duration: timelog.duration ? timelog.duration : 0,
          entry_id: saved[0].id
        })
      }
    }
  }
})
ipcMain.handle('db.entry.removeTimeLogsByIds', async (_event, args: string[]) => {
  await EntryTimelog.destroy({ where: { id: { [Op.in]: args } } })
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
  return Promise.resolve(mappedEntries)
})

ipcMain.handle('db.entry.removeById', async (_event, args: string) => {
  await Entry.destroy({
    cascade: true,
    where: {
      id: args
    }
  })
})

ipcMain.handle('db.entry.getEntryReport', async (_event, args: string) => {
  const response = await Entry.findByPk(args, { include: [{ model: EntryTimelog, as: 'timelogs' }] })
  if (!response) {
    return Promise.resolve()
  }

  const report: EntryReportDO = { all: { sum: 0 }, monthly: [] }
  response.timelogs?.forEach((tl) => {
    const item = report.monthly.find((mr) => mr.date === dayjs(tl.date).format('YYYY-MM'))
    if (item) {
      item.sum += tl.duration
    } else {
      report.monthly.push({ date: dayjs().format('YYYY-MM'), sum: tl.duration })
    }

    report.all.sum += tl.duration
  })

  return Promise.resolve(report)
})
