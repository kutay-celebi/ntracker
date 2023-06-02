import { BaseEntity } from './BaseEntity'

export class Todo extends BaseEntity<Todo> {
  declare label: string
  declare dueDate: Date
  declare completed: boolean
}

export interface TodoDO {
  label: string
  dueDate: Date
  completed: boolean
}
