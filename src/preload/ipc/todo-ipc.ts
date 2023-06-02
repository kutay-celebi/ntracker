import { ipcMain } from 'electron'
import { Todo } from '../db/types/Todo'

ipcMain.handle('db.todo.getTodos', async (_event, _args) => {
  const todos = await Todo.findAll()
  return todos.map((todo) => todo.get({ plain: true }))
})
