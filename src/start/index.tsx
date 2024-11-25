import { useState } from 'react';

import { Tabs, Tab, Box } from '@mui/material';
import OpenKdbx from './open';
import NewKdbx from './new';
import type { kdbxDB } from '../../utools/keepass';
import { openKdbx } from '../utils/keepass';
import './style.scss';

interface Props {
  onEnter: (keedb: kdbxDB) => void;
}

enum activeTab {
  OPEN = 0,
  NEW = 1
}

export type actionType = 'kdbx' | 'kdbx_key' | 'key_file';

export default function Start(props: Props) {
  const [tabValue, setTabValue] = useState(activeTab.OPEN);

  let kdbxFilePath: string, kdbxFileData: ArrayBuffer;
  let kdbxKeyPath: string, kdbxKeyData: ArrayBuffer;
  // let KeyFilePath: string, KeyData: ArrayBuffer;

  const selectFile = (action: actionType) => {
    const { filename, filepath, buffer } = window.services.selectFile2Import();
    switch (action) {
      case 'kdbx':
        {
          kdbxFilePath = filepath;
          kdbxFileData = buffer;
        }
        break;
      case 'kdbx_key':
        {
          kdbxKeyPath = filepath;
          kdbxKeyData = buffer;
        }
        break;
      // case 'key_file':
      //   {
      //     KeyFilePath = filepath;
      //     KeyData = buffer;
      //   }
      //   break;
      default:
        break;
    }

    return filename;
  };

  const handleEnter = async (password: string) => {
    try {
      switch (tabValue) {
        case activeTab.OPEN: {
          const kdbx = await openKdbx(
            password,
            kdbxFilePath,
            kdbxKeyPath,
            kdbxFileData,
            kdbxKeyData
          );
          kdbx && props.onEnter(kdbx);
        }
        case activeTab.NEW: {
          // utools.dbStorage.setItem('kdbx', kdbx.db);
          break;
        }
        default:
          break;
      }
    } catch (error) {
      console.log("error!!!")
    }
  };

  const handleChange = () => {
    setTabValue(tabValue === activeTab.OPEN ? activeTab.NEW : activeTab.OPEN);
  };

  return (
    <Box sx={{ width: '100%' }} className='setting-body'>
      <Tabs value={tabValue} onChange={handleChange} centered>
        <Tab label='打开' />
        <Tab label='新建' />
      </Tabs>
      <Box sx={{ p: 3 }}>
        {tabValue === 0 && (
          <OpenKdbx onEnter={handleEnter} selectFile={selectFile} />
        )}
        {tabValue === 1 && (
          <NewKdbx onEnter={handleEnter} selectFile={selectFile} />
        )}
      </Box>
    </Box>
  );
}
