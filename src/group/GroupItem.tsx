import {
  EventHandler,
  ReactNode,
  SyntheticEvent,
  memo,
  useState,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faIcons from 'virtual:fortawesome-import';
import { shallow, useDataStore } from '../store';
import { T_Group } from '../typings/data';

interface Props {
  indexKey: string
  groups: T_Group[]
  group: T_Group
  isParent: boolean
  deep: number
  isInput: boolean
  title: string
  iconId: number
  badge: number
  children?: ReactNode
  move: (sourceKey: string, targetKey: string) => void
  onExpand: EventHandler<SyntheticEvent<Element, Event>>
  onBlur: EventHandler<SyntheticEvent<HTMLInputElement, Event>>
}

function GroupItem(props: Props) {
  const [
    setIds, setIndexes, setGroups,
    groupId, group2Entries
  ] = useDataStore(state => [
    state.setIds,
    state.setIndexes,
    state.setGroups,
    state.groupId,
    state.group2Entries
  ], shallow)

  const {
    groups,
    group,
    deep,
    children,
    isInput,
    onBlur,
    onExpand,
    isParent
  } = props;

  const [_CollectedProps, DragSource, DragPreview] = useDrag({
    type: 'treenode',
    item: {
      id: props.id
    },
    canDrag(monitor) {
      return !props.isInput;
    },
    isDragging(monitor) {
      return group.id === monitor.getItem().id;
    }
  });

  const [{ isOverCurrent, canDrop }, DropTarget] = useDrop({
    accept: ['treenode', 'account'],
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      itemType: monitor.getItemType()
    }),
    canDrop(item: any, _monitor) {
      item = _monitor.getItem();
      if (item.entry) {
        if (item.entry.group.id === group.id) return false;
        return true;
      }
      if (group.id.indexOf(item.id) === 0) return false;
      if (item.id?.substr(0, item.id.lastIndexOf('-')) === props.id)
        return false;
      if (props.deep > 6) return false;
      return true;
    },
    drop(item: any, monitor) {
      item = monitor.getItem();
      if (!isOverCurrent) return;
      if (monitor.didDrop()) return;
      const targetKey = props.id;
      if (item.entry) {
        props.append(item.entry, targetKey);
        return;
      }
      const sourceKey = item.id;
      props.move(sourceKey, targetKey);
    }
  });

  const badge = group2Entries[group.id].length
  console.log('xxGroupItem rendered!', deep,
    isParent,
    children,
    isInput,
    badge
  );

  const left = deep * 14 + 16;

  const onItemClick = () => {
    setIds({
      groupId: group.id,
      entryId: ''
    })
    setIndexes({ entryIndex: -1 })
  }

  /** 点击展开 */
  const expandItem = () => {
    const indexes = props.indexKey.split("-")

    let group = props.group;
    indexes.forEach((s, h) => {
      const i = Number(s);
      // 新建的数据库默认产生一个默认组，包含所有子租
      group = h === 0 ? groups[i] : group.items[i]
    })

    console.log(indexes, group)
    group.expanded = !props.group.expanded

    setGroups([
      ...groups
    ])
  }

  function isExpanded() {
    return group.expanded && isParent
  }

  return (
    <div
      ref={(node) => DragSource(DropTarget(node))}
      style={isOverCurrent && canDrop ? { opacity: 0.3 } : undefined}
    >
      <div className='group-node'>
        {isParent && (
          <div
            onClick={expandItem}
            style={{ left: deep * 14 + 4 }}
            className={
              isExpanded()
                ? 'icon-arrow-down'
                : 'icon-arrow-right'
            }
          />
        )}
        <div
          style={{ paddingLeft: left }}
          className={
            'group-node-body' + (group.id === groupId ? ' group-node-selected' : '')
          }
          onClick={onItemClick}
        >
          {/* // TODO 所有操作最好移动到外部新窗口 */}
          {/* 编辑操作 */}
          {isInput ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className='group-node-edit-box'
            >
              <input
                type='text'
                autoFocus
                onKeyDown={(e) => {
                  if (e.keyCode === 13) {
                    e.stopPropagation();
                    e.preventDefault();
                    onBlur(e);
                  }
                }}
                onFocus={(e) => e.target.select()}
                onBlur={onBlur}
                defaultValue={group.title}
              />
            </div>
          ) : (
            <div className='group-node-title'>
              <FontAwesomeIcon icon={faIcons[group.iconId]} />
              {group.title}
            </div>
          )}
          {!isInput && badge > 0 && (
            <div className='group-node-badge'>
              <span>{badge}</span>
            </div>
          )}
        </div>

        {/* 拖拽预览 */}
        <div ref={DragPreview} style={{ left }} className='group-node-preview'>
          {group.title}
        </div>
      </div>
      {children}
    </div>
  );
}

export default memo(GroupItem)
