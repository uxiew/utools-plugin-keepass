import { Dialog, DialogTitle, DialogActions, IconButton, Tooltip, Button } from '@mui/material/';
import { Remove as RemoveIcon, Add as AddIcon } from '@mui/icons-material';

interface Props {

}

const isMacOS = window.utools.isMacOS()

export function EntryFooter(prop: Props) {

  return <div className='entry-footer'>
    <Tooltip
      title={'新增帐号 ' + (isMacOS ? '⌘' : 'Ctrl') + '+N'}
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
}
