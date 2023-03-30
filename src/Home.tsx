import React, { useEffect } from 'react';
import './styles/home.scss';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import Group from './group';
import EntryContainer from './entry';
import Search from './Search';
import SnackbarMessage from './SnackbarMessage';
import ExportDialog from './ExportDialog';
import type { AlertColor } from '@mui/material';
import type { KdbxEntry, KdbxGroup } from 'kdbxweb';
import type { T_Entry, T_Group, Entry } from './typings/data';
import { useStore } from './store';

interface Props {
  keyIV: string;
  onOut: () => void;
}

interface State {
  selectedGroupId: string;
  sortedGroup: string[];
  searchKey: string;
  exportData: { group: T_Group } | null;

  group2Entry: Record<string, Entry[]>;
  groupTree: T_Group[];
  groupIds: string[];
  decryptEntryDic?: Record<
    string,
    Partial<{ title: string; usename: string; entry: string }>
  >;
}

export default function Home(props: Props) {
  let detectLiveTimeout: NodeJS.Timeout | null = null;

  // state: State = {
  //   selectedGroupId: '',
  //   sortedGroup: [],
  //   searchKey: '',
  //   snackbarMessage: { key: 0, type: 'info' as AlertColor, body: '' },
  //   exportData: null,
  //   group2Entry: {},
  //   groupIds: [],
  //   groupTree: []
  // };

  const { groups, snackbarMessage, setMessage, setSelectedId } = useStore();

  /**
   * @description 窗口无焦点 5 分钟，自动退出
   */
  const handleDetectLive = () => {
    detectLiveTimeout = setTimeout(() => {
      detectLiveTimeout = null;
      props.onOut();
    }, 5 * 60 * 1000);
  };

  const handleClearDetectLiveTimeout = () => {
    if (!detectLiveTimeout) return;
    clearTimeout(detectLiveTimeout);
    detectLiveTimeout = null;
  };

  // function init() {
  //   const groups = utools.db.allDocs('group/');
  //   const groupDic: any = {};

  //   const groupIds: string[] = [];
  //   const groupTree: DbDoc[] = [];
  //   const group2Entry = {};
  //   const decryptEntryDic = {};

  //   if (groups.length > 0) {
  //     groups
  //       .sort((a, b) =>
  //         a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' })
  //       )
  //       .forEach((g) => {
  //         groupDic[g._id] = g;
  //       });
  //     groups.forEach((g) => {
  //       if (g.parentId && g.parentId in groupDic) {
  //         if (groupDic[g.parentId].childs) {
  //           groupDic[g.parentId].childs.push(g);
  //         } else {
  //           groupDic[g.parentId].childs = [g];
  //         }
  //       } else {
  //         groupTree.push(g);
  //       }
  //       groupIds.push(g._id);
  //     });
  //     // 获取解密 KEYIV
  //     const keyiv = props.keyIV;
  //     // 获取所有帐号
  //     const accounts = window.utools.db.allDocs('entry/');
  //     if (accounts.length > 0) {
  //       for (const account of accounts) {
  //         if (account.groupId in group2Entry) {
  //           group2Entry[account.groupId].push(account);
  //         } else {
  //           group2Entry[account.groupId] = [account];
  //         }
  //         decryptEntryDic[account._id] = { account };
  //         if (account.title) {
  //           try {
  //             decryptEntryDic[account._id].title = window.services.decryptValue(
  //               keyiv,
  //               account.title
  //             );
  //           } catch (e) {
  //             decryptEntryDic[account._id].title = account.title;
  //           }
  //         }
  //         if (account.username) {
  //           try {
  //             decryptEntryDic[account._id].username =
  //               window.services.decryptValue(keyiv, account.username);
  //           } catch (e) {
  //             decryptEntryDic[account._id].username = account.username;
  //           }
  //         }
  //       }
  //       for (const groupId in group2Entry) {
  //         if (group2Entry[groupId].length > 1) {
  //           group2Entry[groupId] = group2Entry[groupId].sort(
  //             (a, b) => a.sort - b.sort
  //           );
  //         }
  //       }
  //     }
  //   }

  //   return { groupTree, groupIds, group2Entry, decryptEntryDic };
  // }

  // function initKdbxData() {
  //   const groups = window.kdbx.groups;

  //   const groupIds: string[] = [];
  //   const groupTree: T_Group[] = [];
  //   const group2Entry: Record<string, Entry[]> = {};
  //   const decryptEntryDic: Record<
  //     string,
  //     { entry?: T_Entry; title?: string; username?: string }
  //   > = {};

  //   if (groups.length > 0) {
  //     // groups.sort((a, b) =>
  //     //   (a.name || '').localeCompare(b.name || '', 'zh-Hans-CN', {
  //     //     sensitivity: 'accent'
  //     //   })
  //     // );

  //     groups.forEach((g) => {
  //       groupTree.push({
  //         id: g.id,
  //         title: g.title
  //         // notes: g.notes
  //       });
  //       // groupIds.push(g._id);
  //     });

  //     // 获取所有帐号条目
  //     // const groups: Record<string, Entry> = window.kdbx.groups;

  //     for (const { id, entries } of groups) {
  //       group2Entry[id] = entries;
  //     }
  //     // for (const id in entries) {
  //     //   if (id in group2Entry) {
  //     //     group2Entry[id].push(entry);
  //     //   } else {
  //     //     group2Entry[id] = [entry];
  //     //   }
  //     //   decryptEntryDic[id] = {
  //     //     entry: {
  //     //       _id: id,
  //     //       id: id,
  //     //       title: entry.fields.get('Title'),
  //     //       username: entry.fields.get('UserName')
  //     //     }
  //     //   };
  //     //   if (entry.fields.get('Title')) {
  //     //     try {
  //     //       decryptEntryDic[id].title = entry.fields.get('Title');
  //     //     } catch (e) {
  //     //       decryptEntryDic[id].title = entry.fields.get('Title');
  //     //     }
  //     //   }
  //     //   if (entry.fields.get('UserName')) {
  //     //     try {
  //     //       decryptEntryDic[id].username = entry.fields.get('UserName');
  //     //     } catch (e) {
  //     //       decryptEntryDic[id].username = entry.fields.get('UserName');
  //     //     }
  //     //   }
  //     // }
  //     // for (const groupId in group2Entry) {
  //     //   if (group2Entry[groupId].length > 1) {
  //     //     group2Entry[groupId] = group2Entry[groupId].sort(
  //     //       (a, b) => a.sort - b.sort
  //     //     );
  //     //   }
  //     // }
  //   }
  //   return { groupTree, groupIds, group2Entry, decryptEntryDic };
  // }

  // useEffect(() => {
  //   setState(initKdbxData());
  //   window.addEventListener('blur', handleDetectLive);
  //   window.addEventListener('focus', handleClearDetectLiveTimeout);
  //   window.utools.setSubInput(({ text }) => {
  //     setState({ searchKey: text });
  //   }, '标题/用户名搜索');

  //   return unmount;
  // });

  // function unmount() {
  //   const { group2Entry, sortedGroup } = state;
  //   if (sortedGroup.length > 0) {
  //     for (const groupId of sortedGroup) {
  //       if (groupId in group2Entry) {
  //         const length = group2Entry[groupId].length;
  //         for (let i = 0; i < length; i++) {
  //           const account = group2Entry[groupId][i];
  //           if (account.sort !== i) {
  //             account.sort = i;
  //             window.utools.db.put(account);
  //           }
  //         }
  //       }
  //     }
  //   }
  //   handleClearDetectLiveTimeout();
  //   window.removeEventListener('blur', handleDetectLive);
  //   window.removeEventListener('focus', handleClearDetectLiveTimeout);
  // }

  const alertDbError = () => {
    setMessage({
      key: Date.now(),
      body: '数据写入错误，保存失败',
      type: 'error'
    });
  };

  const handleGroupUpdate = (node: T_Group) => {
    //   const group = { ...node };
    //   delete group.childs;
    //   const result = window.utools.db.put(group);
    //   if (result.ok) {
    //     node._rev = result.rev;
    //   } else {
    //     alertDbError();
    //   }
  };

  const handleGroupCreate = (node: T_Group, parentNode: T_Group) => {
    //   const result = window.utools.db.put({
    //     _id: 'group/' + Date.now(),
    //     name: node.name,
    //     parentId: parentNode ? parentNode.id : ''
    //   });
    //   if (result.ok) {
    //     node.id = result.id;
    //     node._rev = result.rev;
    //   } else {
    //     alertDbError();
    //   }
  };

  const handleGroupDelete = (node: T_Group) => {
    console.log('删除 group');
    //   // const result = window.utools.db.remove(node);
    //   // if (result.error) {
    //   //   alertDbError();
    //   // }
  };

  const handleGroupMove = (sourceNode: T_Group, targeNode: T_Group) => {
    /* if (targeNode) {
      sourceNode.parentId = targeNode._id;
    } else {
      sourceNode.parentId = '';
    }
    handleGroupUpdate(sourceNode); */
  };

  const handleGroupSelect = (group?: T_Group) => {
    setSelectedId({ selectedGroupId: group ? group.id : '' });
  };

  const handleEntryCreate = () => {
    //   const { selectedGroupId, group2Entry, decryptEntryDic } = state;
    //   if (!selectedGroupId) return;
    //   const dateNow = Date.now();
    //   const newEntry: T_Entry = {
    //     _id: 'account/' + dateNow,
    //     groupId: selectedGroupId,
    //     createAt: dateNow
    //   };
    //   if (selectedGroupId in group2Entry) {
    //     newEntry.sort =
    //       group2Entry[selectedGroupId][group2Entry[selectedGroupId].length - 1]
    //         .sort! + 1;
    //   } else {
    //     newEntry.sort = 0;
    //   }
    //   const result = window.utools.db.put(newEntry);
    //   if (result.error) {
    //     return alertDbError();
    //   }
    //   newEntry._id = result.id;
    //   newEntry._rev = result.rev;
    //   if (selectedGroupId in group2Entry) {
    //     group2Entry[selectedGroupId].push(newEntry);
    //   } else {
    //     group2Entry[selectedGroupId] = [newEntry];
    //   }
    //   decryptEntryDic[newEntry._id] = { entry: newEntry };
    //   setState({ selectedGroupId });
  };

  const handleEntryUpdate = (entry: T_Entry) => {
    /*  const result = window.utools.db.put(entry);
    if (result.ok) {
      entry._rev = result.rev;
    } else {
      if (result.error && result.name === 'conflict') {
        // 修改冲突
        const newdoc = window.utools.db.get(entry._id);
        entry._rev = newdoc._rev;
        const retry = window.utools.db.put(entry);
        if (retry.ok) {
          entry._rev = result.retry;
        } else {
          alertDbError();
        }
      } else {
        alertDbError();
      }
    } */
  };

  const handleEntryDelete = (entry: T_Entry) => {
    //   const { group2Entry, decryptEntryDic } = state;
    //   const result = window.utools.db.remove(entry);
    //   if (result.error) {
    //     return alertDbError();
    //   }
    //   group2Entry[entry.groupId].splice(
    //     group2Entry[entry.groupId].indexOf(entry),
    //     1
    //   );
    //   if (group2Entry[entry.groupId].length === 0) {
    //     delete group2Entry[entry.groupId];
    //   }
    //   delete decryptEntryDic[entry._id];
    //   setState({ selectedGroupId: entry.groupId });
  };

  const handleEntryGroupChange = (entry: T_Entry, targetGroupId: string) => {
    //   const group2Entry = state.group2Entry;
    //   group2Entry[entry.groupId].splice(
    //     group2Entry[entry.groupId].indexOf(entry),
    //     1
    //   );
    //   if (group2Entry[entry.groupId].length === 0) {
    //     delete group2Entry[entry.groupId];
    //   }
    //   if (targetGroupId in group2Entry) {
    //     entry.sort =
    //       group2Entry[targetGroupId][group2Entry[targetGroupId].length - 1]
    //         .sort! + 1;
    //     group2Entry[targetGroupId].push(entry);
    //   } else {
    //     entry.sort = 0;
    //     group2Entry[targetGroupId] = [entry];
    //   }
    //   entry.groupId = targetGroupId;
    //   handleEntryUpdate(entry);
  };

  const findGroupById = (id: string, childs: T_Group['childs']) => {
    //   for (const c of childs) {
    //     if (c._id === id) return c;
    //     if (c.childs) {
    //       return findGroupById(id, c.childs);
    //     }
    //   }
    //   return null;
  };

  const handleExport = (node: T_Group) => {
    // setState({ exportData: { group: node } });
  };

  // if (!group2Entry) {
  //   return (
  //     <div className='home-loading'>
  //       <div className='home-loading-spinner'>
  //         <div className='home-loading-bounce1' />
  //         <div className='home-loading-bounce2' />
  //         <div className='home-loading-bounce3' />
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className='home'>
      <SnackbarMessage message={snackbarMessage} />
      {/* {searchKey ? (
        <Search
          keyIV={''}
          onAccountUpdate={handleEntryUpdate}
          groupTree={groupTree}
          group2Entry={group2Entry}
          searchKey={searchKey}
        />
      ) : ( */}
      <DndProvider backend={HTML5Backend}>
        <div className='home-body'>
          <div>
            {groups && (
              <Group
                onUpdate={handleGroupUpdate}
                onDelete={handleGroupDelete}
                onCreate={handleGroupCreate}
                onExport={handleExport}
                onAppend={handleEntryGroupChange}
                onMove={handleGroupMove}
                onSelect={handleGroupSelect}
              />
            )}
          </div>
          <div>
            <EntryContainer
              onCreate={handleEntryCreate}
              onUpdate={handleEntryUpdate}
              onDelete={handleEntryDelete}
            />
          </div>
        </div>
      </DndProvider>
      {/* )} */}
      <ExportDialog
      // data={exportData}
      // group2Entry={group2Entry}
      />
    </div>
  );
}
