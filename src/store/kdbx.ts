import type { Group, Entry, T_Entry, T_Group } from '../typings/data';
import { StateCreator, StoreApi } from 'zustand';

export interface InitialKDBXData {
  /** groups 数组 */
  groups: T_Group[],
  /** groupId <=> Entries */
  group2Entries: Record<string, T_Entry[]>,
  /** 选中的 groupId */
  groupId: string,
  /** 选中的 entryId */
  entryId?: string
}

export interface KDBXStore extends InitialKDBXData {
  /** 选中的 group 索引 */
  groupIndex: number,
  /** 选中的 entry 索引 */
  entryIndex: number,
}

export interface KDBXActions {
  /** 初始化 数据库 s */
  initState: (groups: Group[]) => void
  search: (word: string) => T_Entry[]
  getGroup: (groupId: string) => T_Group
  /** 设置 索引值s */
  setIndexes: (indexes: {
    groupIndex?: number;
    entryIndex?: number
  }) => void
  setGroups: (groups: T_Group[]) => void
  /** 设置 groupid && entryId */
  setIds: (ids: {
    groupId?: string;
    entryId?: string
  }) => void
}

function initKDBXData(_groups: Group[], _get: StoreApi<KDBXStore & KDBXActions>['getState']): InitialKDBXData {
  const data = {
    groups: window.kdbx._state.groups,
    group2Entries: window.kdbx._state.g2eMap,
    groupId: window.kdbx._state.defaultId,
  }
  // @ts-ignore
  window.db = data;
  return data
}

// define the store
export const createKDBXStore: StateCreator<KDBXStore & KDBXActions, [], []> = (set, get) => ({
  groups: [],
  group2Entries: {},
  groupId: '',
  entryId: '',
  groupIndex: -1,
  entryIndex: -1,
  search(word: string): T_Entry[] {
    // 全量搜索，searchText 属性包含了includes 标题、用户名、链接、备注
    let results: T_Entry[] = [];
    for (let id in window.kdbx.entryMap) {
      (new RegExp(word, "img")).test(window.kdbx.entryMap[id].searchText) && results.push(window.kdbx.entryMap[id].geState())
    }
    return results
  },
  setIds(ids) {
    set(ids)
  },
  setIndexes(indexes) {
    set(indexes)
    // if (get().entryIndex !== indexes.entryIndex)
    //   set({ entryIndex: index })
  },
  setGroups(groups: T_Group[]) {
    set({ groups })
  },
  getGroup(groupId?: string) {
    return window.kdbx.getGroup(groupId || get().groupId).geState()
  },
  initState(groups) { set(() => initKDBXData(groups, get)) }
})
