import { useDrag, useDrop } from 'react-dnd';
import { useStore } from '../store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Grid from '@mui/material/Grid';
// @ts-ignore
import faIcons from 'virtual:fortawesome-import';
import type { Entry } from '../typings/data';
import type { itemSource } from '../typings/dnd';

import '../styles/entryItem.scss';

// return connectDropTarget(
//   connectDragSource(
//     <div style={{ opacity: isDragging ? 0 : 1 }} className='entry-item'>
//       {isOver && canDrop && <div className='entry-item-sort' />}
//       <div
//         className={
//           'entry-item-body' + (isSelected ? ' entry-item-selected' : '')
//         }
//       >
//         <div id={data.account._id + '_title'}>{data.title}</div>
//         <div
//           className='entry-item-username'
//           id={data.account._id + '_username'}
//         >
//           {data.username}
//         </div>
//       </div>
//     </div>
//   )
// );

interface Props {
  onMove: (fromIndex: number, toIndex: number) => void;
  onClick: (index: number) => void;
  index: number;
  isSelected: boolean;
}

export default function AccountItem(props: Props) {
  const { isSelected, index } = props;

  const { group2Entries, selectedGroupId } = useStore();

  const entry = group2Entries[selectedGroupId][index];

  const [{ canDrop, isOver }, DropTarget] = useDrop(() => ({
    accept: 'account',
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    canDrop(item: any, monitor) {
      if (index - item.index === 1 || index === item.index) return false;
      return true;
    },
    drop(item: any, monitor) {
      if (monitor.didDrop()) {
        return;
      }
      if (item.index < index) {
        props.onMove(item.index, index - 1);
      } else {
        props.onMove(item.index, index);
      }
    }
  }));

  const [{ isDragging }, DragSource] = useDrag<itemSource>(() => ({
    type: 'account',
    item: {
      entry: entry,
      index: index
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={(node) => DragSource(DropTarget(node))}
      style={{ opacity: isDragging ? 0 : 1 }}
      className='entry-item'
    >
      {isOver && canDrop && <div className='entry-item-sort' />}
      <Grid
        container
        alignItems='center'
        className={
          'entry-item-body' + (isSelected ? ' entry-item-selected' : '')
        }
      >
        <Grid item>
          {entry.customIcon ? (
            <img src={entry.customIcon} />
          ) : (
            <FontAwesomeIcon icon={faIcons[entry.iconId]} />
          )}
        </Grid>
        <Grid item xs={10}>
          <div id={entry.id + '_title'}>{entry.fields.title}</div>
          <div className='entry-item-username' id={entry.id + '_username'}>
            {entry.fields.username}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
