import { useEffect, useState } from 'react';
import EntryItem from './EntryItem';
import EntryRoot from './EntryRoot';
import type { T_Entry } from '../typings/data';
import { shallow, useDataStore } from '../store';

interface Props {
  onCreate: () => void;
  onUpdate: (entry: T_Entry) => void;
  onDelete: (entry: T_Entry) => void;
  // sortedGroup: string[];
}

const isMacOS = window.utools.isMacOS()
export default function Entry(props: Props) {
  const [entryIndex, group2Entries, groupId] =
    useDataStore(state => [state.entryIndex, state.group2Entries, state.groupId], shallow);
  const setIndexes = useDataStore(state => state.setIndexes);

  console.log("xxEntry", groupId)

  const entries = group2Entries[groupId];

  if (!entries) return null;

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
        if (entryIndex === 0) {
          setIndexes({ entryIndex: entries.length - 1 });
        } else {
          setIndexes({ entryIndex: entryIndex - 1 });
        }
      } else {
        if (entryIndex === entries.length - 1) {
          setIndexes({ entryIndex: 0 });
        } else {
          setIndexes({ entryIndex: entryIndex + 1 });
        }
      }
      return;
    }
    if (e.code === 'KeyN' && (isMacOS ? e.metaKey : e.ctrlKey)) {
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
          setIndexes({ entryIndex });
        }
      }, 10);
    }
    window.addEventListener('keydown', keydownAction);

    return unmount;
  }, []);

  function unmount() {
    window.localStorage.setItem(
      'entries.selectedIndex',
      entryIndex.toString()
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
    props.onDelete(entries[entryIndex]);
  };

  const handleMoveSort = (fromIndex: number, toIndex: number) => {
    const selectedEntry = entries[entryIndex];
    const fromAccount = entries[fromIndex];

    entries.splice(fromIndex, 1);
    entries.splice(toIndex, 0, fromAccount);
    // if (!sortedGroup.includes(fromAccount.groupId)) {
    //   sortedGroup.push(fromAccount.groupId);
    // }
    setIndexes({ entryIndex: entries.indexOf(selectedEntry) });
  };

  return (
    <div className='entry'>
      <EntryRoot onMove={handleMoveSort} index={entries.length}>
        {entries.map((e, i) => (
          <EntryItem
            key={e.id}
            index={i}
            onMove={handleMoveSort}
          />
        ))}
      </EntryRoot>

      {/* footer */}
      {/* <EntryFooter /> */}
    </div>
  );
}
