import React, { useEffect, useState } from 'react';
import GroupNode from './GroupNode';
import GroupRoot from './GroupRoot';
import Tooltip from '@mui/material/Tooltip';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import type { T_Entry, T_Group } from '../typings/data';
import { useStore } from '../store';

interface TreeProps {
  onUpdate: (node: T_Group) => void;
  onDelete: (node: T_Group) => void;
  onCreate: (node: T_Group, parentNode: T_Group) => void;
  onExport: (node: T_Group) => void;
  onAppend: (entry: any, targetGroupId: string) => void;
  onMove: (sourceNode: T_Group, targeNode: T_Group) => void;
  onSelect: (node?: T_Group) => void;
  // groupIds: string[];
  // group2Entry: Record<string, T_Entry[]>;
  // groupTree: T_Group[];
}

export default function Group(props: TreeProps) {
  const {
    groups,
    snackbarMessage,
    group2Entries,
    selectedGroupId,
    setEntryIndex
  } = useStore();

  const [state, setState] = useState<{
    expandIds: string[];
    inputKey: string;
    selectedIndex: string;
  }>({
    expandIds: [],
    inputKey: '',
    selectedIndex: ''
  });

  useEffect(() => {
    let expandIds = window.localStorage.getItem('Group.expandIds');
    console.log('expandIds', typeof expandIds);
    if (expandIds && expandIds !== 'undefined') {
      expandIds = JSON.parse(expandIds);
      setState({ ...state, expandIds: state.expandIds });
      setTimeout(() => {
        if (props.groupIds && props.groupIds.length > 0) {
          const newExpandIds = expandIds.filter((x) =>
            props.groupIds.includes(x)
          );
          if (newExpandIds.length !== state.expandIds.length) {
            setState({ ...state, expandIds: newExpandIds });
          }
        }
      }, 1000);
    }
    const selectedIndex = window.localStorage.getItem('Group.selectedIndex');
    if (selectedIndex) {
      setTimeout(() => {
        select(selectedIndex);
      }, 10);
    } else {
      setTimeout(() => {
        if (groups.length > 0) {
          select('0');
        }
      }, 10);
    }

    return unmount;
  }, []);

  function unmount() {
    window.localStorage.setItem(
      'Group.expandIds',
      JSON.stringify(state.expandIds)
    );
    window.localStorage.setItem('Group.selectedIndex', state.selectedIndex);
  }

  function getNode(id?: string) {
    if (!id) return null;
    const keys = id.split('-');
    let target = groups[Number(keys.shift()) || 0];
    if (!target) return null;
    for (const index of keys) {
      if (!target.childs) return null;
      target = target.childs[Number(index)];
      if (!target) return null;
    }
    return target;
  }

  const deleteNode = (key: string) => {
    const parentKey = key.substr(0, key.lastIndexOf('-'));
    const nodeIndex = key.substr(key.lastIndexOf('-') + 1);
    if (parentKey) {
      const parentNode = getNode(parentKey);
      parentNode.childs.splice(nodeIndex, 1);
      if (parentNode.childs.length === 0) {
        delete parentNode.childs;
        removeExpandNode(parentNode._id);
      }
    } else {
      props.groupTree.splice(Number(nodeIndex), 1);
    }
  };

  const addExpandNode = (id: string) => {
    if (!state.expandIds.includes(id)) {
      state.expandIds.push(id);
    }
  };

  const removeExpandNode = (id: string) => {
    const { expandIds } = state;
    const index = expandIds.indexOf(id);
    if (index === -1) return;
    expandIds.splice(index, 1);
  };

  const sortChilds = (childs) => {
    return childs.sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-Hans-CN', { sensitivity: 'accent' })
    );
  };

  const handleCreate = () => {
    // const node = { _id: '', name: '' };
    // let inputKey = '';
    // if (selectedIndex) {
    //   if (selectedIndex.split('-').length > 7) return;
    //   const parentNode = getNode(selectedIndex);
    //   if (parentNode.childs) {
    //     parentNode.childs.push(node);
    //   } else {
    //     parentNode.childs = [node];
    //   }
    //   inputKey = selectedIndex + '-' + (parentNode.childs.length - 1);
    //   addExpandNode(parentNode._id);
    // } else {
    //   props.groupTree.push(node);
    //   inputKey = '' + (props.groupTree.length - 1);
    // }
    // setState({ inputKey });
  };

  const handleDelete = () => {
    const { inputKey, selectedIndex } = state;
    if (inputKey) return;
    if (!selectedIndex) return;
    const node = getNode(selectedIndex);
    if (node.childs) return;
    if (group2Entries[node.id]) return;
    deleteNode(selectedIndex);
    props.onDelete(node);
    select('');
  };

  const handleEdit = () => {
    const { inputKey, selectedIndex } = state;
    if (inputKey) return;
    if (!selectedIndex) return;
    setState({ ...state, inputKey: selectedIndex });
  };

  const handleExport = () => {
    const { inputKey, selectedIndex } = state;
    if (inputKey) return;
    if (!selectedIndex) return;
    const node = getNode(selectedIndex);
    props.onExport(node);
  };

  const onUpdate = (key: string, value) => {
    // const node = getNode(key);
    // if (!value) {
    //   if (node.name) {
    //     setState({ inputKey: '' });
    //     return;
    //   }
    //   deleteNode(key);
    //   setState({ inputKey: '' });
    //   return;
    // }
    // const isCreate = node.name === '';
    // node.name = value;
    // // 排序
    // let newKey = '';
    // const parentKey = key.substr(0, key.lastIndexOf('-'));
    // let parentNode = null;
    // if (parentKey) {
    //   parentNode = getNode(parentKey);
    //   parentNode.childs = sortChilds(parentNode.childs);
    //   newKey = parentKey + '-' + parentNode.childs.indexOf(node);
    // } else {
    //   const cloneRoot = [...props.groupTree];
    //   while (props.groupTree.length) {
    //     props.groupTree.pop();
    //   }
    //   sortChilds(cloneRoot).forEach((ele) => props.groupTree.push(ele));
    //   newKey = '' + props.groupTree.indexOf(node);
    // }
    // // 执行更新
    // if (isCreate) {
    //   if (parentNode) {
    //     props.onCreate(node, parentNode);
    //   } else {
    //     props.onCreate(node, null);
    //   }
    // } else {
    //   props.onUpdate(node);
    // }
    // setState({ inputKey: '' });
    // select(newKey);
  };

  const expand = (id: string, key: string) => {
    const { selectedIndex, expandIds } = state;
    const index = expandIds.indexOf(id);
    if (index === -1) {
      expandIds.push(id);
      setState({ ...state, expandIds });
    } else {
      expandIds.splice(index, 1);
      if (selectedIndex !== key && selectedIndex.indexOf(key) === 0) {
        select(key, false);
      } else {
        setState({ ...state, expandIds });
      }
    }
  };

  const select = (index: string, autoExpand = true) => {
    // 切换 group 时，entry index 设为 0
    setEntryIndex(0);
    if (!index) {
      setState({ ...state, selectedIndex: '' });
      props.onSelect();
      return;
    }
    const node = getNode(index);

    if (!node) {
      setState({ ...state, selectedIndex: '' });
      props.onSelect();
      return;
    }
    if (autoExpand && node.childs) {
      addExpandNode(node.id);
    }
    setState({ ...state, selectedIndex: index });
    props.onSelect(node);
  };

  // 组移动
  const move = (sourceKey: string, targetKey: string) => {
    // const parentSourceKey = sourceKey.substr(0, sourceKey.lastIndexOf('-'));
    // const sourceIndex = sourceKey.substr(sourceKey.lastIndexOf('-') + 1);
    // const sourceNode = getNode(sourceKey);
    // let parentSourceNode = null;
    // let parentSourceNodeChilds = null;
    // if (parentSourceKey) {
    //   parentSourceNode = getNode(parentSourceKey);
    //   parentSourceNodeChilds = parentSourceNode.childs;
    // } else {
    //   parentSourceNodeChilds = props.groupTree;
    // }
    // let targetNode = null;
    // let parentTargetNodes = null;
    // if (targetKey) {
    //   targetNode = getNode(targetKey);
    //   if (targetNode.childs) {
    //     if (!targetNode.childs.includes(sourceNode)) {
    //       targetNode.childs.push(sourceNode);
    //     }
    //     targetNode.childs = sortChilds(targetNode.childs);
    //   } else {
    //     targetNode.childs = [sourceNode];
    //   }
    //   addExpandNode(targetNode._id);
    //   props.onMove(sourceNode, targetNode);
    //   if (targetKey.includes('-')) {
    //     parentTargetNodes = [];
    //     const targetKeyArray = targetKey.split('-');
    //     targetKeyArray.pop();
    //     const targetKeyArrayLength = targetKeyArray.length;
    //     for (let i = 0; i < targetKeyArrayLength; i++) {
    //       const tKey = targetKeyArray.join('-');
    //       parentTargetNodes.unshift(getNode(tKey));
    //       targetKeyArray.pop();
    //     }
    //     parentTargetNodes.push(targetNode);
    //   }
    // } else {
    //   if (!props.groupTree.includes(sourceNode)) {
    //     props.groupTree.push(sourceNode);
    //   }
    //   const cloneRoot = [...props.groupTree];
    //   while (props.groupTree.length) {
    //     props.groupTree.pop();
    //   }
    //   sortChilds(cloneRoot).forEach((ele) => props.groupTree.push(ele));
    //   props.onMove(sourceNode, null);
    // }
    // parentSourceNodeChilds.splice(sourceIndex, 1);
    // if (parentSourceNode && parentSourceNodeChilds.length === 0) {
    //   delete parentSourceNode.childs;
    // }
    // let newSelectKey = '';
    // if (targetKey) {
    //   if (targetKey.includes('-')) {
    //     // 遍历查找
    //     let pointerChilds = props.groupTree;
    //     parentTargetNodes.forEach((node) => {
    //       newSelectKey +=
    //         (newSelectKey ? '-' : '') + pointerChilds.indexOf(node);
    //       pointerChilds = node.childs;
    //     });
    //   } else {
    //     newSelectKey = '' + props.groupTree.indexOf(targetNode);
    //   }
    // } else {
    //   newSelectKey = '' + props.groupTree.indexOf(sourceNode);
    // }
    // select(newSelectKey);
  };

  // 帐号追加
  const append = (entry: T_Entry, targetId: string) => {
    const targetGroup = getNode(targetId);
    props.onAppend(entry, targetGroup.id);
    select(targetId);
  };

  const renderGroupNode = (
    groupArr: T_Group[],
    deep: number,
    parentKey?: string
  ) => {
    parentKey = parentKey ? parentKey + '-' : '';

    return groupArr.map((t, i) => {
      const preIndex = parentKey! + i;
      return (
        <GroupNode
          key={t.id}
          groupId={t.id}
          id={preIndex}
          move={move}
          append={append}
          onClick={(e) => {
            e.stopPropagation();
            select(preIndex);
          }}
          onBlur={(e) => onUpdate(preIndex, e.target.value)}
          onExpand={(e) => {
            e.stopPropagation();
            expand(t.id, preIndex);
          }}
          deep={deep}
          isParent={!!t.childs}
          isSelected={state.selectedIndex === preIndex}
          isInput={state.inputKey === preIndex}
          title={t.title}
          iconId={t.iconId}
          badge={group2Entries[t.id].length}
        >
          {t.childs &&
            state.expandIds.includes(t.id) &&
            renderGroupNode(t.childs, deep + 1, preIndex)}
        </GroupNode>
      );
    });
  };

  const isEdit = state.inputKey ? false : !!state.selectedIndex;
  let isDelete = isEdit;

  if (isDelete) {
    const node = getNode(state.selectedIndex);
    if (node) {
      if (node.childs) {
        isDelete = false;
      } else if (group2Entries[node.id]?.length > 0) {
        isDelete = false;
      }
    } else {
      isDelete = false;
    }
  }

  return (
    <div className='tree-normal'>
      <div className='tree-body'>
        <GroupRoot move={move}>{renderGroupNode(groups, 0)}</GroupRoot>
      </div>

      {/* ====底部==== */}
      <div className='tree-footer'>
        <Tooltip title='新增分组' placement='top'>
          <div>
            <IconButton
              tabIndex={-1}
              disabled={Boolean(state.inputKey)}
              onClick={handleCreate}
              size='small'
            >
              <CreateNewFolderIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title='修改分组' placement='top'>
          <div>
            <IconButton
              tabIndex={-1}
              disabled={!isEdit}
              onClick={handleEdit}
              size='small'
            >
              <EditIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title='导出分组帐号数据' placement='top'>
          <div>
            <IconButton
              tabIndex={-1}
              disabled={!isEdit}
              onClick={handleExport}
              size='small'
            >
              <ArrowCircleDownIcon />
            </IconButton>
          </div>
        </Tooltip>
        <Tooltip title='删除分组' placement='top'>
          <div>
            <IconButton
              tabIndex={-1}
              disabled={!isDelete}
              onClick={handleDelete}
              size='small'
            >
              <DeleteForeverIcon />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
