import { ipcMain } from 'electron'
import { Entry, EntryDO } from '../db/types/Entry'
import { EntryListQuery } from '../db/types/EntryListQuery'
import { EntryReportDO } from '../db/types/EntryReportDO'
import { EntryTimelog } from '../db/types/EntryTimelog'
import { col, fn, InferAttributes, Op, where, WhereOptions } from 'sequelize'
import dayjs from 'dayjs'

ipcMain.handle('db.entry.save', async (_event, args) => {
  for (const obj of args) {
    let entry
    if (!obj.id) {
      entry = await Entry.findOrCreate({
        where: where(fn('lower', col('label')), obj.label.toLowerCase()),
        defaults: { label: obj.label, notes: obj.notes }
      })
    } else {
      entry = await Entry.upsert({
        id: obj.id,
        label: obj.label,
        notes: obj.notes
      })
    }

    if (obj.timelogs) {
      for (const timelog of obj.timelogs) {
        await EntryTimelog.upsert({
          id: timelog.id,
          date: timelog.date,
          duration: timelog.duration ? timelog.duration : 0,
          entry_id: obj.id ? obj.id : entry[0].id
        })
      }
    }
  }
})

ipcMain.on('db.entry.delete', async (_event, args) => {
  await Entry.destroy({ where: { id: args } })
})

ipcMain.handle('db.entry-timelog.removeTimeLogsByIds', async (_event, args: string[]) => {
  await EntryTimelog.destroy({ where: { id: { [Op.in]: args } } })
})

ipcMain.handle('db.entry.queryEntries', async (_event, args: EntryListQuery) => {
  const where: WhereOptions<InferAttributes<Entry>> = {}

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

ipcMain.handle('db.entry.getEntryReport', async (_event, args: string) => {
  const response = await Entry.findByPk(args, { include: [{ model: EntryTimelog, as: 'timelogs' }] })
  if (!response || !response.timelogs) {
    return Promise.resolve()
  }

  const report: EntryReportDO = { notes: response.notes, all: { sum: 0 }, monthly: [] }
  response.timelogs.forEach((tl) => {
    const item = report.monthly.find((mr) => mr.date === dayjs(tl.date).format('YYYY-MM'))
    if (item) {
      item.sum += tl.duration
    } else {
      report.monthly.push({ date: dayjs(tl.date).format('YYYY-MM'), sum: tl.duration })
    }

    report.all.sum += tl.duration
  })

  return Promise.resolve(report)
})
