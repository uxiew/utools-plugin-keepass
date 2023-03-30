import type { ReactNode } from 'react';
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
interface AccountRootProps {
  onMove: (fromIndex: number, toIndex: number) => number;
  index: number;
  children?: React.ReactElement[];
}

export default function AccountRoot(props: AccountRootProps): ReactNode {
  const { children } = props;

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
    <div ref={dropTarget} className='entry-root'>
      {children}
      {isOverCurrent && canDrop && <div className='entry-root-sort' />}
    </div>
  );
}
