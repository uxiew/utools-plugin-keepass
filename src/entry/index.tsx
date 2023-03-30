import { useEffect, useState } from 'react';
import EntryItem from './EntryItem';
import EntryRoot from './EntryRoot';
import EntryForm from './EntryForm';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import type { T_Entry } from '../typings/data';
import { useStore } from '../store';

interface Props {
  onCreate: () => void;
  onUpdate: (entry: T_Entry) => void;
  onDelete: (entry: T_Entry) => void;
  // sortedGroup: string[];
}
export default function EntryContainer(props: Props) {
  const isMacOs = window.utools.isMacOS();

  const { selectedGroupId, group2Entries, selectedEntryIndex, setEntryIndex } =
    useStore();
  const entries = group2Entries[selectedGroupId];

  let [{ showDeleteConfirm }, setState] = useState<{
    showDeleteConfirm: boolean;
  }>({
    showDeleteConfirm: false
  });

  const keydownAction = (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      if (entries.length < 2) return;
      e.preventDefault();
      if (e.code === 'ArrowUp') {
        if (selectedEntryIndex === 0) {
          setEntryIndex(entries.length - 1);
        } else {
          setEntryIndex(selectedEntryIndex - 1);
        }
      } else {
        if (selectedEntryIndex === entries.length - 1) {
          setEntryIndex(0);
        } else {
          setEntryIndex(selectedEntryIndex + 1);
        }
      }
      return;
    }
    if (e.code === 'KeyN' && (isMacOs ? e.metaKey : e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
      window.utools.subInputBlur();
      handleCreate();
    }
  };

  useEffect(() => {
    const selectedIndex = Number(
      window.localStorage.getItem('entries.selectedIndex')
    );
    if (selectedIndex > 0) {
      setTimeout(() => {
        if (selectedIndex < entries.length) {
          setEntryIndex(selectedEntryIndex);
        }
      }, 10);
    }
    window.addEventListener('keydown', keydownAction);

    return unmount;
  }, []);

  function unmount() {
    window.localStorage.setItem(
      'entries.selectedIndex',
      selectedEntryIndex.toString()
    );
    window.removeEventListener('keydown', keydownAction);
  }

  // useEffect(() => {
  //   if (entries) {
  //     if (
  //       props.data === data &&
  //       Date.now() - data[data.length - 1].createAt < 100
  //     ) {
  //       setSelectedIndex(data.length - 1);
  //     } else {
  //       setSelectedIndex(0);
  //     }
  //   }
  // }, [entries]);

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   // eslint-disable-line
  //   if (nextProps.data) {
  //     if (
  //       props.data === nextProps.data &&
  //       Date.now() - nextProps.data[nextProps.data.length - 1].createAt < 100
  //     ) {
  //       setState({ selectedIndex: nextProps.data.length - 1 });
  //       return;
  //     }
  //     setState({ selectedIndex: 0 });
  //   }
  // }

  const handleSelect = (index: number) => {
    if (selectedEntryIndex === index) return;
    setEntryIndex(index);
  };

  const handleCreate = () => {
    props.onCreate();
    setTimeout(() => {
      const titleInput = document.querySelector(
        '#EntryFormTitle'
      ) as HTMLInputElement;
      if (titleInput) titleInput.focus();
    }, 50);
  };

  const handleCloseDeleteConfirm = () => {
    setState((state) => ({ ...state, showDeleteConfirm: false }));
  };

  const handleShowDeleteConfirm = () => {
    if (!entries) return;
    setState((state) => ({ ...state, showDeleteConfirm: true }));
  };

  const handleDelete = () => {
    if (!entries) return;
    setState((state) => ({ ...state, showDeleteConfirm: false }));
    props.onDelete(entries[selectedEntryIndex]);
  };

  const handleMoveSort = (fromIndex: number, toIndex: number) => {
    const selectedEntry = entries[selectedEntryIndex];
    const fromAccount = entries[fromIndex];

    entries.splice(fromIndex, 1);
    entries.splice(toIndex, 0, fromAccount);

    // if (!sortedGroup.includes(fromAccount.groupId)) {
    //   sortedGroup.push(fromAccount.groupId);
    // }
    setEntryIndex(entries.indexOf(selectedEntry));
  };

  if (!entries) return false;

  return (
    <div className='entry-area'>
      <div className='entry-list'>
        <div className='entry-list-body'>
          {entries.length && (
            <EntryRoot onMove={handleMoveSort} index={entries.length}>
              {entries.map((e, i) => (
                <div key={i} onClick={() => handleSelect(i)}>
                  <EntryItem
                    onMove={handleMoveSort}
                    index={i}
                    isSelected={i === selectedEntryIndex}
                    key={e.id}
                  />
                </div>
              ))}
            </EntryRoot>
          )}
        </div>

        {/* footer */}
        <div className='entry-list-footer'>
          <Tooltip
            title={'新增帐号 ' + (isMacOs ? '⌘' : 'Ctrl') + '+N'}
            placement='top'
          >
            <div>
              <IconButton tabIndex={-1} onClick={handleCreate} size='small'>
                <AddIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Tooltip title='删除帐号' placement='top'>
            <div>
              <IconButton
                tabIndex={-1}
                disabled={entries.length === 0}
                onClick={handleShowDeleteConfirm}
                size='small'
              >
                <RemoveIcon />
              </IconButton>
            </div>
          </Tooltip>
          <Dialog open={showDeleteConfirm} onClose={handleCloseDeleteConfirm}>
            <DialogTitle>确认删除此帐号?</DialogTitle>
            <DialogActions>
              <Button onClick={handleCloseDeleteConfirm}>取消</Button>
              <Button onClick={handleDelete} color='primary' autoFocus>
                删除
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
      <div className='entry-area-right'>
        {entries.length && <EntryForm onUpdate={props.onUpdate} />}
      </div>
    </div>
  );
}
