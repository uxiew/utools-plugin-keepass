import { Button, MenuItem, TextField } from '@mui/material';
import {
  Send as SendIcon
} from '@mui/icons-material';
import { useSetState } from 'ahooks';
import { MouseEvent } from 'react';
import './totp.style.scss'
import type { HOTP, TOTP } from 'otpauth';

/**
* https://docs.npmjs.com/configuring-two-factor-authentication/#prerequisites
* 您的设备支持 passkeys，即通过触摸、面部识别、密码或 PIN 验证您身份的密码替换。Passkeys 可用于登录，作为密码和双因素凭据的简单而安全的替代方案。
* 通过求余的方式，计算当前时间与最近一个周期（period）的剩余秒数
*/
export function calculateLeft(period: number) {
  const nowInSecs = Math.floor(Date.now() / 1000);
  return period - (nowInSecs % period) - 1;
}


interface Props {
  data: HOTP | TOTP,
}

const encoderTypes = [
  { label: '默认设置（RFC 6238）', value: 'default' },
  { label: 'Steam©️设置', value: 'steam' },
  { label: '自定义设置', value: 'custom' }
]

const algorithms = [
  { label: 'SHA-1', value: 'SHA1' },
  { label: 'SHA-256', value: 'SHA256' },
  { label: 'SHA-512', value: 'SHA512' }
]

const defaultOtpParams = {
  issuer: "",
  label: "",
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret: new window.services.totp.Secret({ size: 0 }), // or 'OTPAuth.Secret.fromBase32("NB2W45DFOIZA")'
  url: "",
  encoder: "default", // '' | 'steam'
}
/**
* @description One Time Password (HOTP/TOTP) settings
// otpauth://totp/chandlerver5?secret=NNY2ML5YUCQ76YTMPT3RWV2LAANDIXDM&issuer=npm
// otpauth://totp/chandlerver5?secret=XCAA2Z7YZTRY4JPQQ4MOXX7ZMQR4BDEV&issuer=npm
//
* @example

*  default：otpauth://totp/%E8%B1%86%E4%B8%81:xwback@www.docin.com?algorithm=sha1&issuer=%E8%B1%86%E4%B8%81:xwback@www.docin.com&period=30&digits=6&secret=CDGTRHTR

*  steam：otpauth://totp/%E8%B1%86%E4%B8%81:xwback@www.docin.com?algorithm=sha1&issuer=%E8%B1%86%E4%B8%81:xwback@www.docin.com&period=30&digits=5&secret=CDGTRHTR&encoder=steam
otpauth://totp/%E8%B1%86%E4%B8%81?algorithm=sha1&issuer=%E8%B1%86%E4%B8%81&period=30&digits=5&secret=CDGTRHTR&encoder=steam
*  自定义：otpauth://totp/豆丁?algorithm=sha256&issuer=豆丁&period=30&digits=6&secret=CDGTRHTR
    otpauth://totp/%E8%B1%86%E4%B8%81:xwback?secret=CDGTRHTR&period=30&digits=6&issuer=%E8%B1%86%E4%B8%81&algorithm=SHA256
*/
export default function OTP(props: Props) {
  const [otpState, setOtpState] = useSetState(() => {
    if (!props.data) return defaultOtpParams
    return {
      ...defaultOtpParams,
      ...props.data
    }
  })

  console.log("xxTOTP", props, otpState)
  const keydownAction = (e: KeyboardEvent) => {

  };

  const saveOtpSettings = (e: MouseEvent<HTMLButtonElement>) => {

  };

  return (
    <div className='otp-body'>
      <TextField
        fullWidth
        label="密钥"
        size='small'
        value={otpState.secret.base32}
        variant='outlined'
      />
      <TextField
        fullWidth
        label="类型"
        size='small'
        id="outlined-select-currency"
        select
        defaultValue={otpState.encoder}
      >
        {encoderTypes.map(type => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        label="算法"
        size='small'
        id="outlined-select-currency"
        select
        defaultValue={otpState.algorithm}
      >
        {algorithms.map(type => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        label="刷新时间（秒）"
        size='small'
        variant='outlined'
        type='number'
        value={otpState.period}
        onChange={saveOtpSettings}
      />
      <TextField
        fullWidth
        label="口令长度（位）"
        size='small'
        variant='outlined'
        type='number'
        value={otpState.digits}
        onChange={saveOtpSettings}
      />

      <TextField
        fullWidth
        label="URL"
        size='small'
        value={otpState.url}
        variant='outlined'
      />
      <div className='otp-btn-save'>
        <Button
          onClick={saveOtpSettings}
          variant='contained'
          color='primary'
          endIcon={<SendIcon />}
        >
          保存
        </Button>
      </div>
    </div>
  );
}
