import { create } from 'zustand';
import type { Entry, Group } from '../typings/data';

type DataMap<T> = Record<string, T>

type State = {
    hadKdbx: boolean,
    // keyIV: string,
}

type Actions = {
    setHadKdbx: (had: boolean) => void
    // keyIV: (map: DataMap<Group>) => void
}

export const useStartStore = create<State & Actions>(set => ({
    hadKdbx: !!Boolean(window.utools.db.get('kdbx')),
    setHadKdbx: (had) => set((state) => ({
        ...state,
        hadKdbx: had
    }))
}));