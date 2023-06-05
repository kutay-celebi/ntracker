import { BaseDO, BaseEntity } from './BaseEntity'

export class UserSettings extends BaseEntity<UserSettings> {
  declare setting: Setting
  declare settingValue: string
  declare settingType: 'string' | 'boolean' | 'number'
}

export enum Setting {
  DENSE_TABLE = 'DENSE_TABLE',
  FORCE_LABEL = 'FORCE_LABEL',
  ONLY_WEEK_DAYS = 'ONLY_WEEK_DAYS'
}

export interface UserSettingsDO extends BaseDO {
  setting: Setting
  settingValue: string
  settingType: 'string' | 'boolean' | 'number'
}
