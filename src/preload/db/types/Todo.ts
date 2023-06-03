import { BaseEntity } from './BaseEntity'
import { Sort } from './Sort'

export class Todo extends BaseEntity<Todo> {
  declare label: string
  declare dueDate?: Date
  declare completed: boolean
}

export interface TodoDO {
  id?: string
  label: string
  dueDate?: Date
  completed: boolean
}

export interface TodoListQuery {
  completed?: boolean
  sorts?: Sort[]
  timeRange?: Date[]
}
