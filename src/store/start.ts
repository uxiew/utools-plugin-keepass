import { StateCreator } from 'zustand';

export interface StartState {
  hadKdbx: boolean,
  // keyIV: string,
}

export interface StartActions {
  setHadKdbx: (had: boolean) => void
  // keyIV: (map: DataMap<Group>) => void
}


// 启动页面状态
export const ceateStartStore: StateCreator<StartState & StartActions> = (set) => ({
  hadKdbx: !!Boolean(window.utools.db.get('kdbx')),
  setHadKdbx: (had) => set((state) => ({
    ...state,
    hadKdbx: had
  }))
})
