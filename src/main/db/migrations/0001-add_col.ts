import { DataTypes, QueryInterface } from 'sequelize'

export const migration0001 = {
  name: '0001-add_notes_column_to_entry',
  up: async ({ context }: { context: QueryInterface }): Promise<void> => {
    await context.addColumn('entry', 'notes', {
      type: DataTypes.STRING,
      allowNull: true
    })
  },
  down: async ({ context }): Promise<void> => {
    await context.removeColumn('entry', 'notes')
  }
}
