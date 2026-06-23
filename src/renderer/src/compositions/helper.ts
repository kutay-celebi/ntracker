import dayjs from 'dayjs'

export interface Util {
  formatDateTime: (date: Date) => string
  formatHours: (val: number) => string
  formatMonth: (date: string) => string
}
export const useUtil = (): Util => {
  return {
    formatDateTime: (date: Date): string => (date ? dayjs(date).format('YYYY-MM-DD HH:mm') : ''),
    formatHours: (val: number): string => {
      if (!val) return '0h'
      const h = Math.floor(val)
      const m = Math.round((val - h) * 60)
      return m > 0 ? `${h}h ${m}m` : `${h}h`
    },
    formatMonth: (date: string): string => dayjs(date).format('MMMM YYYY')
  }
}
