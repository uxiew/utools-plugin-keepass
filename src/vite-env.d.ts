/// <reference types="vite/client" />


import type { kdbxDB } from '../utools/keepass';


interface ImportMetaEnv {
  readonly VITE_TEST_PASSWORD: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    kdbx: kdbxDB
  }
}

export interface FaIcon {
  prefix: string;
  iconName: string;
  icon: (string | number | any[])[];
}

declare module 'virtual:fortawesome-import' {
  const faIcons: Icon[]
  export default faIcons
}
