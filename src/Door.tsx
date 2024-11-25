import { ChangeEvent, useEffect } from 'react';
import { useSetState } from 'ahooks'
import SubdirectoryArrowLeftIcon from '@mui/icons-material/SubdirectoryArrowLeft';
import { Button, IconButton, InputBase } from '@mui/material';
import Reset from './setting/Reset';

type Props = {
  onVerify: (passText: string, errorCallback: Function) => void;
}

export default function Door(props: Props) {
  const [state, setState] = useSetState({
    fail: false,
    passwordValue: '',
    resetPassword: false,
    isCapsLock: false,
    isComposition: false
  })

  useEffect(() => {
    window.addEventListener('keydown', detectCapsLock)
    window.addEventListener('keyup', detectCapsLock)

    function detectCapsLock(e: KeyboardEvent) {
      if (e.getModifierState('CapsLock')) {
        setState({ isCapsLock: true });
      } else {
        setState({ isCapsLock: false });
      }
    }

    return () => {
      window.removeEventListener('keydown', detectCapsLock)
      window.removeEventListener('keyup', detectCapsLock)
    }

  }, [])


  const handleEnter = () => {
    if (state.fail) return;
    props.onVerify(state.passwordValue, () => {
      setState({ fail: true });
      setTimeout(() => {
        setState({ fail: false });
      }, 1000);
    });
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (state.isComposition) return;
    setState({ passwordValue: event.target.value });
  };

  const handleInputKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    if (event.keyCode === 229) {
      if (!state.isComposition) setState({ isComposition: true });
      target.blur();
      setTimeout(() => {
        target.focus();
      }, 300);
      return;
    }
    if (state.isComposition) setState({ isComposition: false });
    if (event.keyCode !== 13) return;
    event.preventDefault();
    handleEnter();
  };

  const handleResetClick = () => {
    setState({ resetPassword: true });
  };

  const handleResetOut = () => {
    setState({ resetPassword: false });
  };

  const { fail, resetPassword, passwordValue, isCapsLock, isComposition } =
    state;

  if (resetPassword) return <Reset onOut={handleResetOut} />;

  return (<div className={'door-body' + (fail ? ' door-fail' : '')}>
    <div>
      <div className={'door-input' + (fail ? ' door-swing' : '')}>
        <InputBase
          autoFocus
          fullWidth
          type='password'
          placeholder='主密码'
          value={passwordValue}
          onKeyDown={handleInputKeydown}
          onInput={handleInput}
        />
        <div className='door-input-enter'>
          <IconButton onClick={handleEnter}>
            <SubdirectoryArrowLeftIcon />
          </IconButton>
        </div>
        <div className='door-tooltip'>
          {isCapsLock && <div>键盘大写锁定已打开</div>}
          {isComposition && <div>请切换到英文输入法</div>}
        </div>
      </div>
    </div>
    <div>
      <Button onClick={handleResetClick}>打开或新建数据库</Button>
    </div>
  </div>)

}
