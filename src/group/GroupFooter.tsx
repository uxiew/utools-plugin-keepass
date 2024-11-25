import { memo } from "react"
import { useSetState } from "ahooks"
import { IconButton, Tooltip } from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  DeleteForever as DeleteForeverIcon,
  CreateNewFolder as CreateNewFolderIcon
} from '@mui/icons-material';

// /* ====底部==== */
function GroupFooter() {

  const [state, setState] = useSetState({
    inputKey: ''
  })

  const handleEdit = () => {
    // const { inputKey, selectedIndex } = state;
    // if (inputKey) return;
    // if (!selectedIndex) return;
    // setState({ ...state, inputKey: selectedIndex });
  };

  const handleDelete = () => {
    // const { inputKey, selectedIndex } = state;
    // if (inputKey) return;
    // if (!selectedIndex) return;
    // const node = getNode(selectedIndex);
    // if (node.childs) return;
    // if (group2Entries[node.id]) return;
    // deleteNode(selectedIndex);
    // props.onDelete(node);
    // select('');
  };

  const handleCreate = () => {
    // const node = { _id: '', name: '' };
    // let inputKey = '';
    // if (selectedIndex) {
    //   if (selectedIndex.split('-').length > 7) return;
    //   const parentNode = getNode(selectedIndex);
    //   if (parentNode.childs) {
    //     parentNode.childs.push(node);
    //   } else {
    //     parentNode.childs = [node];
    //   }
    //   inputKey = selectedIndex + '-' + (parentNode.childs.length - 1);
    //   addExpandNode(parentNode._id);
    // } else {
    //   props.groupTree.push(node);
    //   inputKey = '' + (props.groupTree.length - 1);
    // }
    // setState({ inputKey });
  };

  const isEdit = state.inputKey ? false : !!state.selectedIndex;
  let isDelete = isEdit;

  return (
    <div className='group-footer' >
      <Tooltip title='设置' placement='top'>
        <div>
          <IconButton
            tabIndex={-1}
            disabled={!isEdit}
            onClick={handleEdit}
            size='small'
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title='保存' placement='top'>
        <div>
          <IconButton
            tabIndex={-1}
            disabled={!isEdit}
            onClick={handleEdit}
            size='small'
          >
            <SaveIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title='新增分组' placement='top'>
        <div>
          <IconButton
            tabIndex={-1}
            disabled={Boolean(state.inputKey)}
            onClick={handleCreate}
            size='small'
          >
            <CreateNewFolderIcon />
          </IconButton>
        </div>
      </Tooltip>
      <Tooltip title='删除分组' placement='top'>
        <div>
          <IconButton
            tabIndex={-1}
            disabled={!isDelete}
            onClick={handleDelete}
            size='small'
          >
            <DeleteForeverIcon />
          </IconButton>
        </div>
      </Tooltip>
    </div>
  )
}


export default memo(GroupFooter)
