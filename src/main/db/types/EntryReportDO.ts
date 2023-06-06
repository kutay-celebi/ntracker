import { EntryReportItemDO } from './EntryReportItemDO'

export interface EntryReportDO {
  all: EntryReportItemDO
  monthly: EntryReportItemDO[]
}
