import { DataTypes, QueryInterface } from 'sequelize'
import log from 'electron-log'

export const migration0001 = {
  name: '0001-add_notes_column_to_entry',
  up: async ({ context }: { context: QueryInterface }): Promise<void> => {
    await context.describeTable('entry').then(async (value) => {
      if (value.notes) {
        log.info('notes column is already exists')
        return Promise.resolve()
      }

      await context.addColumn('entry', 'notes', {
        type: DataTypes.STRING,
        allowNull: true
      })
    })
  },
  down: async (): Promise<void> => {}
}
