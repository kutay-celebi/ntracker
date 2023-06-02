import { ipcMain } from 'electron'
import { Todo, TodoDO, TodoListQuery } from '../db/types/Todo'
import { InferAttributes, Op, Order, WhereOptions } from 'sequelize'

ipcMain.handle('db.todo.getTodos', async (_event, args: TodoListQuery) => {
  let where: WhereOptions<InferAttributes<Todo, { omit: never }>> = {}

  if (args && args.completed !== undefined) {
    where.completed = {
      [Op.eq]: args.completed
    }
  }

  if (args && args.timeRange) {
    where = {
      ...where,
      [Op.or]: [
        {
          dueDate: {
            [Op.gte]: args.timeRange[0],
            [Op.lte]: args.timeRange[1]
          }
        },
        {
          dueDate: {
            [Op.is]: undefined
          }
        }
      ]
    }
  }

  let sorts: Order = []
  if (args && args.sorts) {
    sorts = args.sorts.map((sort) => {
      return [sort.field, sort.direction]
    })
  }

  const todos = await Todo.findAll({
    where: where,
    order: sorts
  })

  return todos.map((todo) => todo.get({ plain: true }))
})

ipcMain.handle('db.todo.saveTodo', async (_event, args: TodoDO) => {
  return await Todo.upsert(args)
})
