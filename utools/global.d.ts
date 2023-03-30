import type { kdbxDB } from './keepass';
import * as kdbxweb from 'kdbxweb';
import type { IconName } from '@fortawesome/free-solid-svg-icons';


declare module 'virtual:fortawesome-import' {
  const faIcons: Icon[]
  export default faIcons
}

declare module 'uTools' {
  import Utools from 'utools-api-types';
  export = Utools;
}


type KEY_IV = {
  key: string,
  iv: string,
}

declare global {
  interface Window {
    kdbx: kdbxDB
    services: {
      keepass: typeof kdbxDB,
      readBuffer: (path: string) => ArrayBuffer
      getKeyIv: (passphrase: string) => KEY_IV
      encryptValue: (keyIv: KEY_IV, data: string) => string
      decryptValue: (keyIv: KEY_IV, data: string) => string
      selectFile2Import: () => ({ filename: string, filepath: string, buffer: any }),
    }
  }
}
