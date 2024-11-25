import React, { useRef, useState } from "react"
import {
  Shuffle as ShuffleIcon,
  SafetyCheckOutlined as SafetyCheckOutlinedIcon,
} from "@mui/icons-material"
import { Popover, IconButton, InputAdornment, TextField, Tooltip } from "@mui/material"
import OTP, { calculateLeft } from "../../components/OTP"
import TOTPTimer, { TOTAL_PROGRESS } from "../../components/TOTP.timer"
import { useInterval } from "ahooks"
import type { TOTP, HOTP } from 'otpauth';
import type { T_Entry } from "../../typings/data"

interface Props {
  otp: T_Entry['extraFields']['otp'],
  onCopy: (v?: string) => () => void
}
interface IRefTOTP {
  btnElRef: React.RefObject<HTMLButtonElement>,
}

function generateState(code: string, period: number, otp: TOTP | HOTP) {
  const leftSeconds = calculateLeft(period)
  // 不关心的环形进度条，总数 TOTAL_PROGRESS
  const progress = leftSeconds * TOTAL_PROGRESS / period;
  if (leftSeconds === period - 1) {
    code = otp.generate()
  }

  return {
    code,
    progress,
    count: leftSeconds,
  }
}

function EntryTOTP({ otp: uri, onCopy }: Props) {
  let otp_URI = typeof uri === 'string' ? uri : uri.getText()
  const otpBtnElRef = useRef(null)
  const otp = window.services.totp.URI.parse(otp_URI)
  const period = (otp as TOTP).period

  const [showOtp, setShowOtp] = useState(false)
  const [state, setState] = useState({
    code: otp.generate(),
    progress: 0,
    count: 0
  });
  console.log("xxxotp", period)

  useInterval(() => setState(
    ({ code }) => generateState(code, period, otp)),
    1000,
    { immediate: true }
  );

  return <>
    <Popover
      open={showOtp}
      anchorEl={otpBtnElRef.current}
      onClose={() => setShowOtp(false)}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
    >
      <OTP data={otp} />
    </Popover >
    <TextField
      fullWidth
      label='2FA / OTP'
      id='accountFormTitle'
      onClick={() => ('title')}
      value={state.code}
      variant='standard'
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <SafetyCheckOutlinedIcon className='entry-form-prev-icon' />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position='start'>
            <Tooltip
              title='点击复制口令'
              placement='top-end'
            >
              <IconButton
                tabIndex={-1}
                onClick={onCopy(state.code)}
                size='small'
              >
                <TOTPTimer value={state.progress} indicator={state.count} />
              </IconButton>
            </Tooltip>
            <i className='entry-form-icon-divider' />
            <Tooltip
              title='查看'
              placement='top-end'
            >
              <IconButton
                tabIndex={-1}
                onClick={() => setShowOtp(true)}
                size='small'
                ref={otpBtnElRef}
              >
                <ShuffleIcon />
              </IconButton>
            </Tooltip>
          </InputAdornment >
        )
      }}
    />
  </>
}

export default React.memo(EntryTOTP)
