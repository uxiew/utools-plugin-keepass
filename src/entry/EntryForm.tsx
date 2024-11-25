import React, { KeyboardEvent } from 'react';
import { useDataStore, shallow } from '../store';
import Basis from './Basis';
import Advanced from './Advanced';
import TabsContainer from '../components/TabsContainer';
import AttrViewer, { AnnouncementIcon } from '../components/AttrViewer';
import {
  DesignServices as DesignServicesIcon,
  LibraryAdd as LibraryAddIcon
} from '@mui/icons-material';
import type { T_Entry } from '../typings/data';
import type { TabValue } from '../components/TabsContainer';
import '../styles/entryForm.scss';

interface Props {
  onUpdate: (entry: T_Entry) => void
  entry: T_Entry
}

const isMacOs = window.utools.isMacOS();

// AccountForm
function EntryForm(props: Props) {
  const [setMessage, entryIndex] = useDataStore(state => [state.setMessage, state.entryIndex], shallow);
  const { id, fields, customIconId, icon, attachments, extraFields } = props.entry

  console.log("xxEntryForm", extraFields);

  const onKeydown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (
      (e.code === 'KeyU' || e.code === 'KeyP') &&
      (isMacOs ? e.metaKey : e.ctrlKey)
    ) {
      e.preventDefault();
      e.stopPropagation();
      window.utools.hideMainWindow();
      handleCopy(e.code === 'KeyU' ? fields.username : fields.password)();
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


  // 复制
  const handleCopy = (value?: string) => () => {
    const status = value && window.utools.copyText(value);
    status && setMessage({
      type: 'success',
      body: "复制成功"
    })
  };

  const tabs: TabValue[] = [
    {
      label: "基本条目", icon: <DesignServicesIcon />, Comp: <Basis
        fields={fields} otp={extraFields.otp}
        icon={icon}
        customIconId={customIconId}
        onCopy={handleCopy}
      />
    },
    { label: "高级条目", icon: <LibraryAddIcon />, Comp: <Advanced fields={extraFields} attachments={attachments} /> },
    { label: "数据属性", icon: <AnnouncementIcon />, Comp: <AttrViewer groupId={props.entry.groupId} entryIndex={entryIndex} /> }
  ]

  return <TabsContainer tabs={tabs} />;
}



export default React.memo(EntryForm)
