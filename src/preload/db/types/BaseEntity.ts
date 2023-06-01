import { InferAttributes, InferCreationAttributes, Model } from 'sequelize'

export class BaseEntity<M extends Model> extends Model<InferAttributes<M>, InferCreationAttributes<M>> {
  declare id?: string
}

export interface BaseDO {
  id?: string
}
