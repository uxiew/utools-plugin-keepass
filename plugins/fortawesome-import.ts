// @ts-ignore
import { IconMap as iconList } from '../utools/preload';
import { kebabToPascal } from "./string"

export interface FaIcon {
  prefix: string;
  iconName: string;
  icon: (string | number | any[])[];
}

interface Options {
  customIcons: FaIcon[]
}

export default function fortIconImportPlugin(options: Options) {
  const virtualModuleId = 'virtual:fortawesome-import'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  const icons: Options['customIcons'] = iconList.map((icon) => {
    for (const faIcon of options.customIcons) {
      if (faIcon.iconName === icon) return faIcon
    }
    try {
      return require(`./node_modules/@fortawesome/free-solid-svg-icons/fa${kebabToPascal(icon)}.js`).definition
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") throw (error.code)
    }
  })
  // console.log("icons", icons)

  return {
    name: 'fortIconImportPlugin', // 必须的，将会在 warning 和 error 中显示
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `const icons = ${JSON.stringify(icons)};
                export default icons;`
      }
    },
  }
}
