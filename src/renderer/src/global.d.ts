import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  declare interface Window {
    electron: ElectronAPI
    api: any
  }
}

declare module '~icons/*' {
  import { FunctionalComponent, SVGAttributes } from 'vue'
  const component: FunctionalComponent<SVGAttributes>
  export default component
}

export {}
