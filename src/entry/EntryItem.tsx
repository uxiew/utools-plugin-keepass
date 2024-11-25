import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  SafetyCheckOutlined as SafetyCheckOutlinedIcon,
  AttachFileSharp as AttachFileSharpIcon
} from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import faIcons from 'virtual:fortawesome-import';
import type { itemSource } from '../typings/dnd';
import { shallow, useDataStore } from '../store';
import '../styles/entryItem.scss';

//  connectDropTarget(
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
  index: number;
}

export default function EntryItem(props: Props) {
  const [groupId, entryId, entryIndex, group2Entries] = useDataStore(state => [state.groupId, state.entryId, state.entryIndex, state.group2Entries], shallow);

  const [setIds, setIndexes] = useDataStore(state => [state.setIds, state.setIndexes], shallow);

  const entry = group2Entries[groupId][props.index];
  // isSelected = { i === entryIndex

  console.log("xxEntryItem", groupId, entryIndex);

  const [{ canDrop, isOver }, DropTarget] = useDrop(() => ({
    accept: 'account',
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    }),
    canDrop(item: any, monitor) {
      if (entryIndex - item.index === 1 || entryIndex === item.index) return false;
      return true;
    },
    drop(item: any, monitor) {
      if (monitor.didDrop()) {
        return;
      }
      if (item.index < entryIndex) {
        props.onMove(item.index, entryIndex - 1);
      } else {
        props.onMove(item.index, entryIndex);
      }
    }
  }));

  const [{ isDragging }, DragSource] = useDrag<itemSource>(() => ({
    type: 'account',
    item: {
      entry: entry,
      index: entryIndex
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));


  const onItemClick = () => {
    setIds({
      entryId: entry.id
    })
    setIndexes({ entryIndex: props.index })
  }

  const EntryIcon = () => entry.customIcon ? (
    <img src={entry.customIcon} />
  ) : (
    <FontAwesomeIcon icon={faIcons[entry.iconId]} />
  )


  return (
    <div
      ref={(node) => DragSource(DropTarget(node))}
      style={{ opacity: isDragging ? 0 : 1 }}
      className='entry-item'
      onClick={onItemClick}
    >
      {isOver && canDrop && <div className='entry-item-sort' />}
      <Grid
        container
        alignItems='center'
        justifyContent='center'
        className={
          'entry-item-body' + (entryId === entry.id ? ' entry-item-selected' : '')
        }
      >
        <Grid>
          <EntryIcon />
        </Grid>
        <Grid xs={8} className='entry-item-title'>
          <div id={entry.id + '_title'}>{entry.fields.title}</div>
          <div className='entry-item-username' id={entry.id + '_username'}>
            {entry.fields.username}
          </div>
        </Grid>
        <Grid maxWidth={20}>
          {
            entry.extraFields.otp && <SafetyCheckOutlinedIcon htmlColor='#849eab' />
          }
          {
            entry.attachments.length > 0 && <AttachFileSharpIcon htmlColor='#849eab' />
          }
          {
            !entry.extraFields.otp && !entry.attachments.length && <svg />
          }
        </Grid>
      </Grid>
    </div>
  );
}
