import type { EventHandler, ReactNode, SyntheticEvent } from 'react';
import { useDrop } from 'react-dnd';

interface Props {
  move: (sourceKey: string, targetKey: string) => void;
  children?: ReactNode;
}

interface itemSource {
  id: string;
}
interface collectedProps {
  isOverCurrent: boolean;
  canDrop: boolean;
}

export default function GroupRoot(props: Props) {
  const [{ isOverCurrent, canDrop }, DropTarget] = useDrop<
    itemSource,
    any,
    collectedProps
  >(() => ({
    accept: 'treenode',
    collect: (monitor) => ({
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    canDrop(item, _monitor) {
      if (item.id.indexOf('-') === -1) return false;
      return true;
    },
    drop(item, monitor) {
      if (!isOverCurrent) return;
      if (monitor.didDrop()) {
        return;
      }
      props.move(item.id, '');
    }
  }));

  const { children } = props;

  return (
    <div
      ref={DropTarget}
      className='tree-root'
      style={isOverCurrent && canDrop ? { opacity: 0.5 } : undefined}
    >
      <div className='tree-root-child'>{children}</div>
    </div>
  );
}
