import { shallow as zstShallow } from 'zustand/shallow'
import { create } from "zustand";
import { createMessageStore, MessageStore } from "./message";
import { createKDBXStore, KDBXStore, KDBXActions } from "./kdbx";
import { ceateStartStore, StartState, StartActions } from "./start";

type DBStore = KDBXStore
  & KDBXActions
  & MessageStore
  & StartState
  & StartActions

export const useDataStore = create<DBStore>((...params) => ({
  ...createKDBXStore(...params),
  ...createMessageStore(...params),
  ...ceateStartStore(...params)
}))

type Obj = any[] | object | string | number | boolean


/**
* 推荐使用 Array pick 的范式
* @example const [nuts, honey] = useStore((state) => [state.nuts, state.honey], shallow)
*/
const shallow = (objA: Obj, objB: Obj) => {
  if (Array.isArray(objA)) {
    for (let i = 0; i < objA.length; i++) {
      if (!zstShallow(objA[i], (objB as any[])[i])) return false
    }
    return true
  }
  return zstShallow(objA, objB)
  // if(Obj)
}


export { shallow }
