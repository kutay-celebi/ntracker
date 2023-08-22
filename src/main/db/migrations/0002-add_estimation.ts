import { DataTypes, QueryInterface } from 'sequelize'
import log from 'electron-log'

export const migration0002 = {
  name: '0002-add-estimation-col',
  up: async ({ context }: { context: QueryInterface }): Promise<void> => {
    await context.describeTable('entry').then(async (value) => {
      if (value.estimation) {
        log.info('notes column is already exists')
        return Promise.resolve()
      }

      await context.addColumn('entry', 'estimation', {
        type: DataTypes.FLOAT,
        allowNull: true
      })
    })
  },
  down: async (): Promise<void> => {}
}
