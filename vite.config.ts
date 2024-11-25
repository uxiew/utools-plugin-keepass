import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import utools from '@ver5/vite-plugin-utools';

import fortawesomeImport from './plugins/fortawesome-import';
import { faIcons as customIcons } from "./plugins/icons"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ tsDecorators: true }),
    fortawesomeImport({
      customIcons,
    }),
    // @ts-ignore
    utools({
      configFile: './utools/plugin.json',
      autoType: true,
      preload: {
        watch: true,
        name: 'services',
        // minify: true,  // build 时应该自动 minify?
        // onGenerate(code: string) {
        //   return code.replace(/globalScope\./g, '')
        // }
      },
      // buildUpx: false
      // buildUpx: {
      //   outName: '[pluginName]_[version].upx',
      // },
    })
  ]
})
