import type { Entry, T_Entry } from "./data"



export interface DropProps {
    isOverCurrent: boolean;
    canDrop: boolean;
}


export interface itemSource {
    entry: T_Entry;
    index: number;
} 