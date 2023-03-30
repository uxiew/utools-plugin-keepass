import type { AlertColor } from '@mui/material';
import { create } from 'zustand';
import type { Group, T_Entry, T_Group } from '../typings/data';

type DataMap<T> = Record<string, T>

type Message = { key: number; type: AlertColor; body: string };
type State = {
    entries: T_Entry[],
    groups: T_Group[],
    group2Entries: Record<string, T_Entry[]>,
    selectedGroupId: string,
    selectedEntryIndex: number,
    snackbarMessage: Message
}

type Actions = {
    setEntries: (ids: {
        selectedGroupId: string;
    }) => void
    initState: (groups: Group[]) => void
    setMessage: (message: Message) => void
    setEntryIndex: (i: number) => void
    setSelectedId: (ids: {
        selectedGroupId?: string;
        selectedEntryId?: string
    }) => void
}

// define the store
export const useStore = create<State & Actions>((set, get) => ({
    groups: [],
    entries: [],
    group2Entries: {},
    selectedGroupId: '',
    selectedEntryIndex: 0,
    snackbarMessage: { key: 0, type: 'info' as AlertColor, body: '' },
    // keyIV: '',
    setMessage: (message: Message) => set(() => ({
        snackbarMessage: message
    })),
    setSelectedId: ({ selectedGroupId }) => set({
        selectedGroupId,
    }),
    setEntryIndex: (index: number) => set({
        selectedEntryIndex: index,
    }),
    setEntries: ({ selectedGroupId }) => set(({ entries }) => {
        if (!selectedGroupId) return { entries }
        return {
            entries: window.kdbx.groupMap[selectedGroupId].entries.map((e) => {
                return {
                    id: e.id,
                    groupId: selectedGroupId,
                    tags: e.tags,
                    created: e.created,
                    icon: e.icon,
                    iconId: e.iconId,
                    customIcon: e.customIcon,
                    fields: {
                        title: e.title,
                        username: e.username,
                        password: e.password.getText(),
                        notes: e.notes,
                        url: e.url
                    },
                    attachments: ['']
                }
            })
        }
    }),
    initState: (groups) => set(() => {
        const tempMap: Record<string, T_Entry[]> = {}
        return {
            selectedGroupId: groups[0].id,
            groups: groups.map((g) => {
                tempMap[g.id] = g.entries.map((e) => {
                    return {
                        id: e.id,
                        groupId: g.id,
                        tags: e.tags,
                        created: e.created,
                        icon: e.icon,
                        iconId: e.iconId,
                        customIcon: e.customIcon,
                        fields: {
                            title: e.title,
                            username: e.username,
                            password: e.password.getText(),
                            notes: e.notes,
                            url: e.url
                        },
                        attachments: ['']
                    }
                })
                return {
                    id: g.id,
                    title: g.title,
                    iconId: g.iconId,
                    entries: get().entries
                }
            }),
            group2Entries: tempMap,
        }
    })
}));
