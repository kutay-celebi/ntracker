import { ElectronAPI } from '@electron-toolkit/preload'
import { api } from '../../preload/index'

declare global {
  declare interface Window {
    electron: ElectronAPI
    api: typeof api
  }
}

declare module '~icons/*' {
  import { FunctionalComponent, SVGAttributes } from 'vue'
  const component: FunctionalComponent<SVGAttributes>
  export default component
}

export {}
