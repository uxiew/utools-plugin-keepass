import { useState } from 'react';
import { Button, Grid, TextField } from '@mui/material';
import { Key as KeyIcon } from '@mui/icons-material';
import useStart from '../hooks/useStart';
import type { actionType } from '.';

interface Props {
  selectFile: (actionType: actionType) => string;
  onEnter: (password: string) => void;
}
export default function openKdbx(props: Props) {
  const { password: masterPassword, handlePasswordChange } =
    useStart(handleOkClick);

  const [fileNames, setFileNames] = useState({
    kdbxFileName: '',
    KeyFileName: ''
  });

  function handleOkClick() {
    props.onEnter(masterPassword);
  }

  const open = () => {
    const kdbxFileName = props.selectFile('kdbx');
    if (kdbxFileName) setFileNames({ ...fileNames, kdbxFileName });
  };

  const openKeyFile = () => {
    const KeyFileName = props.selectFile('kdbx_key');
    if (KeyFileName) setFileNames({ ...fileNames, KeyFileName });
  };

  return (
    <Grid
      container
      direction='row'
      justifyContent='center'
      className='setting-body'
    >
      <div className='setting-container'>
        <div>
          <TextField
            error={!masterPassword}
            variant='standard'
            autoFocus
            type='password'
            fullWidth
            label='主密钥'
            value={masterPassword}
            onChange={handlePasswordChange}
            helperText={masterPassword ? 'errors' : ''}
          />
        </div>
        <div className='key-file'>
          <Button onClick={open}>
            <KeyIcon />
            &nbsp;<span>kdbx 文件 {fileNames.kdbxFileName}</span>
          </Button>
        </div>
        <div className='key-file'>
          <Button onClick={openKeyFile}>
            <KeyIcon />
            &nbsp;<span>密钥文件 {fileNames.KeyFileName}</span>
          </Button>
        </div>
        <div>
          <Button
            onClick={handleOkClick}
            disabled={!masterPassword || !fileNames.kdbxFileName}
            fullWidth
            color='primary'
            size='large'
            variant='contained'
          >
            确认
          </Button>
        </div>
      </div>
    </Grid>
  );
}
