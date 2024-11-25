import { useSetState } from 'ahooks';
import { Box, InputAdornment, TextField } from '@mui/material';
import {
  AccountBox as AccountBoxIcon,
  DesignServices as DesignServicesIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { shallow, useDataStore } from '../store';
import TabsContainer from '../components/TabsContainer';
import '../styles/GroupDetail.scss';
import IconsManager from '../components/IconsManager';
import AttrViewer, { AnnouncementIcon } from '../components/AttrViewer';
import type { TabValue } from '../components/TabsContainer';

export default function GroupDetail() {
  const [groupId, getGroup] = useDataStore(state => [state.groupId, state.getGroup], shallow)
  const [groupState, setGroupState] = useSetState(getGroup)

  const handleInputChange = (t: string) => {

  }

  const tabs: TabValue[] = [
    {
      label: "群组信息", icon: <DesignServicesIcon />, Comp: <div className="detail-form">
        <TextField
          fullWidth
          label='名称'
          onChange={handleInputChange('name')}
          value={groupState.title}
          variant='standard'
        />

        <TextField
          fullWidth
          label='备注'
          onChange={handleInputChange('note')}
          value={groupState.notes}
          variant='standard'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <AccountBoxIcon className='entry-form-prev-icon' />
              </InputAdornment>
            )
          }}
        />
      </div>,
    },
    {
      label: "数据属性", icon: <AnnouncementIcon />, Comp: < AttrViewer groupId={groupId} />
    },
    // {
    //   label: "图标管理", icon: <AnnouncementIcon />, Comp: <IconsManager />
    // }
  ]

  return <div className="detail">
    <TabsContainer tabs={tabs} />
  </div>
}
