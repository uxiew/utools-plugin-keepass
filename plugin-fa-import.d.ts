
interface Icon {
  prefix: string;
  iconName: string;
  icon: (string | number | any[])[];
}

declare module 'virtual:fortawesome-import' {
  const faIcons: Icon[]
  export default faIcons
}