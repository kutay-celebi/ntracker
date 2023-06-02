import dayjs from 'dayjs'

export interface Util {
  formatDateTime: (date: Date) => string
}
export const useUtil = (): Util => {
  return {
    formatDateTime: (date: Date): string => dayjs(date).format('YYYY-MM-DD HH:mm')
  }
}
