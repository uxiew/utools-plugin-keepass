import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import {
  Title as TitleIcon,
  AccountBox as AccountBoxIcon,
  Link as LinkIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  ContentCopy as ContentCopyIcon,
  BeenhereOutlined as BeenhereOutlinedIcon,
  OpenInNew as OpenInNewIcon,
  Lock as LockIcon,
  Shuffle as ShuffleIcon,
  ImageSearchOutlined as ImageSOIcon
} from '@mui/icons-material';
import EentryTOTP from './EentryTOTP';
import EntryRandomPassword, { IRandomPopoverRef } from "./EntryRandomPassword";
import { useCallback, useRef } from "react";
import type { T_Entry } from "../../typings/data";
import { useSetState } from "ahooks";
import IconsManager from "../../components/IconsManager";

interface Props {
  fields: T_Entry['fields'],
  icon: T_Entry['icon'],
  customIconId: T_Entry['customIconId'],
  otp: T_Entry['extraFields']['otp'],
  onCopy: (v?: string) => () => void
}
const isMacOs = window.utools.isMacOS();

export default function Basis(props: Props) {
  const randomRef = useRef<IRandomPopoverRef>(null)
  const rpBtnElRef = useRef<HTMLButtonElement>(null)

  const { fields, otp, onCopy: handleCopy } = props
  const [state, setState] = useSetState({
    passwordEye: false,
    iconOpen: false,
  });


  // 打开链接
  const handleOpenLink = () => {
    if (!fields.url) return;
    window.utools.hideMainWindow(false);
    window.utools.shellOpenExternal(fields.url);
  };

  // 显示密码
  const handlePasswordVisible = () => setState({ passwordEye: !state.passwordEye });

  const handleInputChange = (fieldKey: string) => (e: InputEvent) => {
    const value = e.target.value;
    if (fieldKey === 'title' || fieldKey === 'username') {
      // props.decryptAccountDic[props.entry._id][field] = value;
      document.getElementById(id + '_' + fieldKey).innerText = value;
    }
    // setState({ [field]: value });
    if (inputDelayTimer) {
      clearTimeout(inputDelayTimer);
    }
    const doc = entries[0];

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


  // showIcon
  const toggleIconOpen = useCallback((show: boolean) => () => {
    setState({ iconOpen: show })
  }, [])

  return <div className="entry-form-basis">
    <TextField
      fullWidth
      label='标题'
      id='accountFormTitle'
      onChange={handleInputChange('title')}
      value={fields.title}
      variant='standard'
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <TitleIcon className='entry-form-prev-icon' />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='end'>
            <Tooltip
              title={
                '修改图标'
              }
              placement='top-end'
            >
              <IconButton
                tabIndex={-1}
                onClick={toggleIconOpen(true)}
                size='small'
              >
                <ImageSOIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    <IconsManager url={fields.url}
      icon={props.icon}
      customIconId={props.customIconId}
      open={state.iconOpen}
      onClose={toggleIconOpen(false)}
    />
    <TextField
      fullWidth
      label='用户名'
      onChange={handleInputChange('username')}
      value={fields.username}
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
                onClick={handleCopy(fields.username)}
                size='small'
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    {/* TOTP */}
    {otp && <EentryTOTP otp={otp} onCopy={handleCopy} />}
    <TextField
      type={state.passwordEye ? 'text' : 'password'}
      fullWidth
      label='密码'
      onChange={handleInputChange('password')}
      value={fields.password}
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
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
            <i className='entry-form-icon-divider' />
            <Tooltip title='生成随机密码' placement='top'>
              <IconButton
                tabIndex={-1}
                onClick={() => randomRef.current?.showRandom()}
                size='small'
                ref={rpBtnElRef}
              >
                <ShuffleIcon />
              </IconButton>
            </Tooltip>
            <i className='entry-form-icon-divider' />
            <Tooltip
              title={
                '复制密码，快捷键 ' + (isMacOs ? 'Command' : 'Ctrl') + '+P'
              }
              placement='top-end'
            >
              <IconButton
                tabIndex={-1}
                onClick={handleCopy(fields.password)}
                size='small'
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    <TextField
      fullWidth
      label='链接'
      onChange={handleInputChange('url')}
      value={fields.url}
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
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
            <span className='entry-form-icon-divider' />
            <Tooltip
              title={
                '复制链接'
              }
              placement='top-end'>
              <IconButton
                tabIndex={-1}
                onClick={handleCopy(fields.url)}
                size='small'
              >
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
    <TextField
      fullWidth
      label='备注'
      multiline
      rows={9}
      value={fields.notes}
      onChange={handleInputChange('notes')}
      InputLabelProps={{ shrink: true }}
      variant='outlined'
      className='entry-form-remark'
    />
    {/* 随机密码 */}
    <EntryRandomPassword
      ref={randomRef}
      rpEl={rpBtnElRef}
    />
  </div >
}
