import type {
  EventHandler,
  MouseEventHandler,
  ReactNode,
  SyntheticEvent
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// @ts-ignore
import faIcons from 'virtual:fortawesome-import';

interface TreeNodeProps {
  key: string;
  groupId: string;
  id: string;
  move: (sourceKey: string, targetKey: string) => void;
  append: (sourceKey: string, targetKey: string) => void;
  onClick: MouseEventHandler<HTMLDivElement>;
  onBlur: EventHandler<SyntheticEvent<HTMLInputElement, Event>>;
  onExpand: EventHandler<SyntheticEvent<Element, Event>>;
  deep: number;
  isParent: boolean;
  isSelected: boolean;
  isInput: boolean;
  title: string;
  iconId: number;
  badge: number;
  children?: ReactNode;
}

export default function GroupNode(props: TreeNodeProps) {
  const {
    deep,
    onClick,
    isParent,
    children,
    isSelected,
    isInput,
    title,
    badge,
    onBlur,
    iconId,
    onExpand
  } = props;

  console.log('Icons', props, iconId, faIcons[iconId]);

  const [_CollectedProps, DragSource, DragPreview] = useDrag({
    type: 'treenode',
    item: {
      id: props.id
    },
    canDrag(monitor) {
      return !props.isInput;
    },
    isDragging(monitor) {
      return props.id === monitor.getItem().id;
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
        if (item.entry.group.id === props.groupId) return false;
        return true;
      }
      if (props.id.indexOf(item.id) === 0) return false;
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

  const left = deep * 16 + (isParent ? 0 : 15) + 8;

  return (
    <div
      ref={(node) => DragSource(DropTarget(node))}
      style={isOverCurrent && canDrop ? { opacity: 0.3 } : undefined}
    >
      <div onClick={onClick} className='tree-node'>
        <div
          style={{ paddingLeft: left }}
          className={
            'tree-node-body' + (isSelected ? ' tree-node-selected' : '')
          }
        >
          {isParent && (
            <div
              onClick={onExpand}
              className={
                children
                  ? 'tree-node-icon-arrow-down'
                  : 'tree-node-icon-arrow-right'
              }
            />
          )}
          {isInput ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className='tree-node-edit-box'
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
                defaultValue={title}
              />
            </div>
          ) : (
            <div className='tree-node-title'>
              <FontAwesomeIcon icon={faIcons[iconId]} />
              <div className='tree-node-title'>{title}</div>
            </div>
          )}
          {!isInput && badge > 0 && (
            <div className='tree-node-badge'>
              <span>{badge}</span>
            </div>
          )}
        </div>
        <div ref={DragPreview} style={{ left }} className='tree-node-preview'>
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}
