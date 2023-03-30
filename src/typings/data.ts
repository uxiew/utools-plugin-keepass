import type { Kdbx, KdbxEntry, KdbxGroup, ProtectedValue } from "kdbxweb";

export type { Entry } from '../../utools/keepass/Entry';
export type { Group } from '../../utools/keepass/Group';


export interface T_Group {
    id: string,
    title: string,
    iconId: number,
    childs?: T_Group[],
    notes?: string,
    // entriesIds: string[],
}

export interface Entry_Fields {
    title: string,
    notes: string,
    username: string,
    password: string,
    url: string,
}


export interface T_Entry {
    id: string
    groupId: string
    tags: string[]
    icon: string
    iconId: number
    customIcon: string | null
    fields: Partial<Entry_Fields>
    attachments: any[]
    created: Date
    // _rev?: string
    sort?: number
};