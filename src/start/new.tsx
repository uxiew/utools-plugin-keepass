import { Button, Grid, TextField } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import useStart from '../hooks/useStart';
import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { actionType } from '.';

interface Props {
  selectFile: (action: actionType) => string;
  onEnter: (password: string) => void;
}
export default function NewKdbx(props: Props) {
  const scoreWords = [
    '密码太简单',
    '密码太简单',
    '密码强度一般',
    '密码强度较高',
    '密码强度极高'
  ];

  const [keyFilename, setKeyFilename] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordVerifyFail, setConfirmPasswordVerifyFail] =
    useState(false);

  const { password, score, handlePasswordChange } = useStart(handleOkClick);

  function handleOkClick() {
    if (!password || !confirmPassword || score < 2) return;
    if (password !== confirmPassword)
      return setConfirmPasswordVerifyFail(false);
    props.onEnter(password);
  }

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    setConfirmPasswordVerifyFail(false);
  };

  const open = () => {
    const filename = props.selectFile('kdbx_key');
    if (filename) setKeyFilename(filename);
  };

  return (
    <Grid container direction='row' justifyContent='center'>
      <div className='setting-container'>
        <div>
          <TextField
            error={!!password && score < 2}
            variant='standard'
            autoFocus
            type='password'
            fullWidth
            label='主密钥'
            value={password}
            onChange={handlePasswordChange}
            helperText={password ? scoreWords[score] : ''}
          />
        </div>
        <div>
          <TextField
            error={confirmPasswordVerifyFail}
            variant='standard'
            type='password'
            fullWidth
            label='确认主密钥'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            helperText={confirmPasswordVerifyFail ? '密码不一致' : ''}
          />
        </div>
        <div className='key-file'>
          <Button onClick={open}>
            <KeyIcon />
            <span>密钥文件 {keyFilename}</span>
          </Button>
        </div>
        <div>
          <Button
            onClick={handleOkClick}
            disabled={
              !password ||
              !confirmPassword ||
              score < 2 ||
              confirmPasswordVerifyFail
            }
            fullWidth
            color='primary'
            size='large'
            variant='contained'
          >
            确认
          </Button>
          <div className='setting-remark'>注意：请牢记主密钥</div>
        </div>
      </div>
    </Grid>
  );
}
