import { useEffect, useMemo } from 'react';
import GroupItem from './GroupItem';
import GroupRoot from './GroupRoot';
import type { T_Entry, T_Group } from '../typings/data';
import { shallow, useDataStore } from '../store';
import GroupFooter from './GroupFooter';
import { useSetState } from 'ahooks';
import "./styles.scss"

interface GroupProps {
  onUpdate: (node: T_Group) => void;
  onDelete: (node: T_Group) => void;
  onCreate: (node: T_Group, parentNode: T_Group) => void;
  onAppend: (entry: any, targetGroupId: string) => void;
  onMove: (sourceNode: T_Group, targeNode: T_Group) => void;
  // groupIds: string[];
}

export default function Group(props: GroupProps) {
  const [groups, group2Entries] = useDataStore(state => [
    state.groups,
    state.group2Entries,
  ]);

  const setIds = useDataStore(state => state.setIds);

  console.log("xxGroup", props)

  const [state, setState] = useSetState<{
    expandIds: string[],
    selectedIndex: string,
  }>({
    expandIds: [],
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

    return () => {
      window.localStorage.setItem(
        'Group.expandIds',
        JSON.stringify(state.expandIds)
      );
      window.localStorage.setItem('Group.selectedIndex', state.selectedIndex);
    };
  }, []);

  function getNode(id?: string) {
    if (!id) return null;
    const keys = id.split('-');
    let target = groups[Number(keys.shift()) || 0];
    if (!target) return null;
    for (const index of keys) {
      if (!target.items) return null;
      target = target.items[Number(index)];
      if (!target) return null;
    }
    return target;
  }

  const deleteNode = (key: string) => {
    const parentKey = key.substr(0, key.lastIndexOf('-'));
    const nodeIndex = key.substr(key.lastIndexOf('-') + 1);
    if (parentKey) {
      const parentNode = getNode(parentKey);
      parentNode.items.splice(nodeIndex, 1);
      if (parentNode.items.length === 0) {
        delete parentNode.items;
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

  const onUpdate = (key: string, value: any) => {
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

  // 选择组
  const select = (index: string, autoExpand = true) => {
    if (!index) return;
    const group = getNode(index);

    if (!group) {
      setState({ selectedIndex: '' });
      onSelect();
      return;
    }
    if (autoExpand && group.items) {
      addExpandNode(group.id);
    }
    setState({ selectedIndex: index });
    onSelect(group);
  };

  const onSelect = (group?: T_Group) => {
    setIds({ groupId: group?.id });
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

  // 增加 group
  const add = (entry: T_Entry, targetId: string) => {
    const targetGroup = getNode(targetId);
    props.onAppend(entry, targetGroup.id);
    select(targetId);
  };

  const isEdit = state.inputKey ? false : !!state.selectedIndex;

  let isDelete = isEdit;
  if (isDelete) {
    const node = getNode(state.selectedIndex);
    if (node) {
      if (node.items) {
        isDelete = false;
      } else if (group2Entries[node.id]?.length > 0) {
        isDelete = false;
      }
    } else {
      isDelete = false;
    }
  }

  const renderGroupItem = (
    groupList: T_Group[],
    deep: number,
    parentKey: string = ''
  ) => {
    parentKey = parentKey && parentKey + '-'
    return groupList.map((g, i) => {
      const key = parentKey + i;
      return (
        <GroupItem
          key={g.id}
          groups={groups}
          group={g}
          indexKey={key}
          deep={deep}
          move={move}
          isParent={!!g.items.length}
          // append={add}
          onExpand={(e) => {
            e.stopPropagation();
            expand(g.id, key);
          }}
          onBlur={(e) => onUpdate(key, e.target.value)}
          isInput={state.inputKey === key}
        >
          {g.expanded && renderGroupItem(g.items, deep + 1, key)}
        </GroupItem>
      );
    });
  };


  const GroupItems = useMemo(() => renderGroupItem(groups, 0), [groups])

  return (
    <div className='group'>
      <GroupRoot move={move}>{GroupItems}</GroupRoot>
      <GroupFooter />
    </div>
  );
}
