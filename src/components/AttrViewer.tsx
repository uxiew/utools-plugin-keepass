import React, { useMemo } from "react";
import { Box, Button, Divider, TextField } from "@mui/material";
import { DateFormat } from "../utils/date_format";
import type { InitialKDBXData, KDBXStore } from "../store/kdbx";
import type { KdbxTimes } from "kdbxweb";
import { Announcement as AnnouncementIcon } from '@mui/icons-material';
import History from "../entry/History";

interface Props {
  groupId: InitialKDBXData['groupId'],
  entryIndex?: KDBXStore['entryIndex'],
}

export { AnnouncementIcon }

const _getTimes = (times: KdbxTimes) => [times.creationTime!, times.lastModTime!, times.lastAccessTime!]
const getGroupTimes = (groupId: Props['groupId']) => _getTimes(window.kdbx.groupMap[groupId]._group.times)

const getEntryTimes = (groupId: Props['groupId'], entryIndex: Props['entryIndex']) => _getTimes(window.kdbx.groupMap[groupId]._group.entries[entryIndex!].times)

/** 只能查看不能修改 */
export default React.memo(function AttrViewer({ groupId, entryIndex }: Props) {
  const showGroupInfo = entryIndex === undefined || entryIndex < 0
  const data = (showGroupInfo ? getGroupTimes : getEntryTimes)(groupId, entryIndex).map((time, i) =>
    ({ label: i === 0 ? "创建时间" : i === 1 ? "修改时间" : "访问时间", val: time })
  )

  const histories = useMemo(
    () => !showGroupInfo ? window.kdbx.groupMap[groupId].entries[entryIndex]._entry.history : [],
    [groupId, entryIndex]
  )

  return <Box>
    {
      data.map(({ label, val }) => <Box key={label} sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <Box width="90px">{label}：</Box>
        <TextField fullWidth variant="standard" value={DateFormat.dtStr(val)} />
      </Box>
      )
    }

    {/* === entry 历史记录 == */}
    {
      !showGroupInfo && histories.length > 0 ? <Box>
        <Box width="100%" marginBottom="20px" sx={{ display: "flex", alignItems: "baseline" }}>
          历史：
          <Button
            color="error"
            variant="contained"
            sx={{ mt: 1, mr: 1 }}
          >
            清空历史
          </Button>
        </Box>
        <History histories={histories} />
      </Box> : null
    }
  </Box >
})
