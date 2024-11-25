import { useDrop } from 'react-dnd';
import * as React from 'react';

// const boxTarget = {
//   canDrop(props, monitor) {
//     const source = monitor.getItem();
//     if (source.index === props.index - 1) return false;
//     return true;
//   },
//   drop(props, monitor, component) {
//     if (!component.props.isOverCurrent) return;
//     if (monitor.didDrop()) {
//       return;
//     }
//     const source = monitor.getItem();
//     props.onMove(source.index, props.index - 1);
//   }
// };

// @DropTarget('account', boxTarget, (connect, monitor) => ({
//   connectDropTarget: connect.dropTarget(),
//   isOverCurrent: monitor.isOver({ shallow: true }),
//   canDrop: monitor.canDrop()
// }))
interface EntryRootProps {
  onMove: (fromIndex: number, toIndex: number) => number;
  index: number;
  children?: React.ReactElement[];
}

export default function EntryRoot(props: EntryRootProps) {
  const { children, index } = props;
  console.log("xxEntryRoot", index)

  const [{ isOverCurrent, canDrop }, dropTarget] = useDrop({
    accept: 'account',
    collect(monitor) {
      return {
        isOverCurrent: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop()
      };
    },
    canDrop(item, monitor) {
      if (item.index === props.index - 1) return false;
      return true;
    },
    drop(item, monitor) {
      if (!isOverCurrent) return;
      if (monitor.didDrop()) {
        return;
      }
      props.onMove(item.index, props.index - 1);
    }
  });

  return (
    <div className='entry-body' ref={dropTarget}>
      {children}
      {isOverCurrent && canDrop && <div className='entry-root-sort' />}
    </div>
  );
}
