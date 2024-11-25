import { memo } from 'react';
import type { ReactNode } from 'react';
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

function GroupRoot(props: Props) {
  console.log("GroupRoot", props)
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


  return (
    <div
      className='group-body'
      ref={DropTarget}
      style={isOverCurrent && canDrop ? { opacity: 0.5 } : undefined}
    >
      <div className='group-root-child'>{props.children}</div>
    </div>
  );
}
export default memo(GroupRoot)
