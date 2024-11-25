import React, { useEffect, useState } from 'react';
import Passwords from './Passwords';
import Random from './components/password-generator';
import { createTheme, ThemeProvider } from '@mui/material';
import type { Theme } from '@mui/material';
import OTP from './components/OTP';

const themeDic: Record<string, Theme> = {
  light: createTheme({
    typography: {
      fontFamily: 'system-ui'
    },
    palette: {
      mode: 'light'
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableFocusRipple: true
        }
      }
    }
  }),
  dark: createTheme({
    typography: {
      fontFamily: 'system-ui'
    },
    palette: {
      mode: 'dark'
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableFocusRipple: true
        }
      }
    }
  })
};

export default function App() {
  const [state, setState] = useState({
    code: '',
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    // 进入插件
    window.utools.onPluginEnter(({ code }) => {
      setState({ ...state, code });
      // TODO 搜索k}
      window.utools.setSubInput
      console.log("onPluginEnter", code)
    });
    // 退出插件
    window.utools.onPluginOut(() => {
      setState({ ...state, code: '' });
    });

    // 主题切换事件
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        setState({ ...state, theme: e.matches ? 'dark' : 'light' });
      });
  }, [])

  return <ThemeProvider theme={themeDic[state.theme]}>
    {
      ['password', 'keepass'].includes(state.code) ?
        < Passwords /> : (state.code === 'random') ?
          <Random /> : ['otp', 'totp'].includes(state.code) ?
            // TODO
            <Random />/* <OTP data="null" />  */ : null
    }
  </ThemeProvider >
}
