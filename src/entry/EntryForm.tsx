import { ReactComponentElement, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import TitleIcon from '@mui/icons-material/Title';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LinkIcon from '@mui/icons-material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import LockIcon from '@mui/icons-material/Lock';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SendIcon from '@mui/icons-material/Send';
import RandomPassword from '../password-generator/RandomPassword';
import type { Entry_Fields, T_Entry } from '../typings/data';
import { useStore } from '../store';

interface Props {
  onUpdate: (entry: T_Entry) => void;
}
export default function AccountForm(props: Props) {
  const isMacOs = window.utools.isMacOS();
  let randomPasswordRef!: RandomPassword;

  const {
    selectedGroupId,
    group2Entries,
    selectedEntryIndex: entryIndex
  } = useStore();

  const [state, setState] = useState({
    passwordEye: false,
    randomPasswordEl: null
  });

  const { id, fields } = group2Entries[selectedGroupId][entryIndex];

  const {
    title = '',
    username = '',
    password = '',
    notes = '',
    url = ''
  } = fields;

  const keydownAction = (e) => {
    if (
      (e.code === 'KeyU' || e.code === 'KeyP') &&
      (isMacOs ? e.metaKey : e.ctrlKey)
    ) {
      e.preventDefault();
      e.stopPropagation();
      window.utools.hideMainWindow();
      handleCopy(e.code === 'KeyU' ? username : password)();
    }
    if (
      (e.code === 'ArrowUp' || e.code === 'ArrowDown') &&
      (e.keyCode === 229 || e.target.nodeName === 'TEXTAREA')
    ) {
      e.stopPropagation();
    }
  };

  // useEffect(() => {
  //   // const data = entries[entryIndex].fields;
  //   // ['title', 'username', 'password', 'notes', 'url'].forEach((f) => {
  //   //   if (data[f]) {
  //   //     // try {
  //   //     //   stateValue[f] = window.services.decryptValue(
  //   //     //     props.keyIV,
  //   //     //     data[f]
  //   //     //   );
  //   //     // } catch (e) {
  //   //     //   stateValue[f] = data[f];
  //   //     // }
  //   //   }
  //   // });
  //   // setState(stateValue);
  //   window.addEventListener('keydown', keydownAction, true);

  //   return () => window.removeEventListener('keydown', keydownAction, true);
  // }, [entryIndex]);

  // UNSAFE_componentWillReceiveProps(nextProps: Props) {
  //   // eslint-disable-line
  //   const stateValue = {};
  //   ['title', 'username', 'password', 'notes', 'url'].forEach((f) => {
  //     if (nextProps.entry[f]) {
  //       stateValue[f] = nextProps.entry[f];
  //       // try {
  //       //   stateValue[f] = window.services.decryptValue(
  //       //     nextProps.keyIV,
  //       //     nextProps.entry[f]
  //       //   );
  //       // } catch (e) {
  //       //   stateValue[f] = nextProps.entry[f];
  //       // }
  //     } else {
  //       stateValue[f] = '';
  //     }
  //   });
  //   setState(stateValue);
  // }

  const handleInputChange = (field: string) => (e: InputEvent) => {
    const value = e.target.value;
    if (field === 'title' || field === 'username') {
      // props.decryptAccountDic[props.entry._id][field] = value;
      document.getElementById(id + '_' + field).innerText = value;
    }
    // setState({ [field]: value });
    if (inputDelayTimer) {
      clearTimeout(inputDelayTimer);
    }
    const doc = entries[entryIndex];

    // inputDelayTimer = setTimeout(() => {
    //   inputDelayTimer = null;
    //   if (value) {
    //     doc[field] = window.services.encryptValue(props.keyIV, value);
    //   } else {
    //     delete doc[field];
    //   }
    //   props.onUpdate(doc);
    // }, 300);
  };

  const handleCopy = (attr: string) => () => {
    window.utools.copyText(fields[attr]);
  };

  const handlePasswordVisible = () => {
    if (state.passwordEye) {
      setState({ ...state, passwordEye: false });
    } else {
      setState({ ...state, passwordEye: true });
    }
  };

  const handleShowRandomPassword = (e) => {
    setState({ ...state, randomPasswordEl: e.currentTarget });
    setTimeout(() => {
      randomPasswordRef.generateRandom();
    });
  };

  const handleCloseRandomPassword = () => {
    setState({ ...state, randomPasswordEl: null });
  };

  const handleOpenLink = () => {
    if (!url) return;
    window.utools.hideMainWindow(false);
    window.utools.shellOpenExternal(url);
  };

  const handleOkRandomPassword = () => {
    handleInputChange('password')({
      target: { value: randomPasswordRef.getPasswordValue() }
    });
    setState({ ...state, randomPasswordEl: null });
  };

  return (
    <div className='account-form'>
      <div>
        <TextField
          fullWidth
          label='标题'
          id='accountFormTitle'
          onChange={handleInputChange('title')}
          value={title}
          variant='standard'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <TitleIcon className='entry-form-prev-icon' />
              </InputAdornment>
            )
          }}
        />
      </div>
      <div>
        <TextField
          fullWidth
          label='用户名'
          onChange={handleInputChange('username')}
          value={username}
          variant='standard'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <AccountBoxIcon className='entry-form-prev-icon' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip
                  title={
                    '复制用户名，快捷键 ' +
                    (isMacOs ? 'Command' : 'Ctrl') +
                    '+U'
                  }
                  placement='top-end'
                >
                  <IconButton
                    tabIndex={-1}
                    onClick={handleCopy(username)}
                    size='small'
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </div>
      <div>
        <TextField
          type={state.passwordEye ? 'text' : 'password'}
          fullWidth
          label='密码'
          onChange={handleInputChange('password')}
          value={password}
          variant='standard'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <LockIcon className='entry-form-prev-icon' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip
                  title={state.passwordEye ? '关闭明文' : '明文显示'}
                  placement='top'
                >
                  <IconButton
                    tabIndex={-1}
                    onClick={handlePasswordVisible}
                    size='small'
                  >
                    {state.passwordEye ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <span className='entry-form-icon-divider' />
                <Tooltip title='生成随机密码' placement='top'>
                  <IconButton
                    tabIndex={-1}
                    onClick={handleShowRandomPassword}
                    size='small'
                  >
                    <ShuffleIcon />
                  </IconButton>
                </Tooltip>
                <span className='entry-form-icon-divider' />
                <Tooltip
                  title={
                    '复制密码，快捷键 ' + (isMacOs ? 'Command' : 'Ctrl') + '+P'
                  }
                  placement='top-end'
                >
                  <IconButton
                    tabIndex={-1}
                    onClick={handleCopy(password)}
                    size='small'
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
        <Popover
          open={Boolean(state.randomPasswordEl)}
          anchorEl={state.randomPasswordEl}
          onClose={handleCloseRandomPassword}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <div className='random-password-popover'>
            <RandomPassword
              from='accountform'
              ref={(c) => {
                randomPasswordRef = c as RandomPassword;
              }}
            />
            <div className='random-password-popover-footer'>
              <Button
                onClick={handleOkRandomPassword}
                variant='contained'
                color='primary'
                endIcon={<SendIcon />}
              >
                使用该密码
              </Button>
            </div>
          </div>
        </Popover>
      </div>
      <div>
        <TextField
          fullWidth
          label='链接'
          onChange={handleInputChange('url')}
          value={url}
          variant='standard'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <LinkIcon className='entry-form-prev-icon' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip title='浏览器中打开' placement='top'>
                  <IconButton
                    tabIndex={-1}
                    onClick={handleOpenLink}
                    size='small'
                  >
                    <OpenInBrowserIcon />
                  </IconButton>
                </Tooltip>
                <span className='entry-form-icon-divider' />
                <Tooltip title='复制链接' placement='top-end'>
                  <IconButton
                    tabIndex={-1}
                    onClick={handleCopy(url)}
                    size='small'
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </div>
      <div>
        <TextField
          fullWidth
          label='备注'
          multiline
          rows={9}
          value={notes}
          onChange={handleInputChange('notes')}
          InputLabelProps={{ shrink: true }}
          variant='outlined'
          className='entry-form-remark'
        />
      </div>
      <div>
        <TextField
          fullWidth
          label='说明x'
          multiline
          rows={9}
          value={notes}
          onChange={handleInputChange('notes')}
          InputLabelProps={{ shrink: true }}
          variant='outlined'
        />
      </div>
    </div>
  );
}
