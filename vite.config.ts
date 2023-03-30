import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";


// @ts-ignore
import utools from '@ver5/vite-plugin-utools';
// @ts-ignore
import fortawesomeImport from './plugin-fortawesome-import.ts';
// @ts-ignore
import { IconMap as iconList } from './utools/keepass/const/iconMap';
import { faIcons as customIcons } from "./src/utils/icons"


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({ tsDecorators: true }),
    fortawesomeImport({
      iconList,
      customIcons,
      pkgName: "@fortawesome/free-solid-svg-icons",
    }),
    utools({
      pluginFile: './utools/plugin.json',
      external: ['uTools'],
      preload: {
        watch: true,
        name: 'services',
      },
      // buildUpx: false
      // buildUpx: {
      //   outName: '[pluginName]_[version].upx',
      // },
    })
  ]
})
