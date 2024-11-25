import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import faIcons from 'virtual:fortawesome-import';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Typography, Button, Dialog, InputAdornment, TextField, Box, Theme } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import { useDidUpdate } from '../hooks/useDidUpdate';
import type { T_Entry } from '../typings/data';

interface Props {
  open: boolean
  url: T_Entry['fields']['url'],
  icon: T_Entry['icon'],
  customIconId: T_Entry['customIconId'],
  onClose: () => void
}

interface StyledIconProps {
  onClick: () => void
  selected: boolean
}

const StyledIcon = styled("span")((props: StyledIconProps & { theme: Theme }) => {
  const { theme } = props
  console.log(props)
  return {
    display: 'inline-flex',
    flexDirection: 'column',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    width: "18px",
    padding: theme.spacing(1),
    margin: theme.spacing(0.5, 0),
    backgroundColor: props.selected ? "#b0c7cb" : "",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    },
  }
});



/**
* 管理图标
*/
function IconsManager(props: Props) {
  // const {handleOpenClick} = props;

  const { customIconId, icon: iconId } = props

  const [on, toggle] = useState(props.open);

  useDidUpdate(() => {
    props.open && toggle(true)
  }, [props.open])

  const customIcons = window.kdbx.getCustomIcons()

  console.log("xxIconsManager", props)

  const handleIconClick = (icon) => () => {

  };

  const handleLabelClick = (event) => {
    // selectNode(event.currentTarget);
  };

  const close = () => {
    toggle(false)
    props.onClose()
  }

  const downloadIcon = (url?: string) => {
    let urlString;
    const faviconDownloadMethod = "ss"
    switch (faviconDownloadMethod) {
      case "Google":
        urlString = `https://www.google.com/s2/favicons?domain=${url.host ? url.host : ""}`;
        break;
      case "DuckDuckGo":
        urlString = `https://icons.duckduckgo.com/ip3/${url.host ? url.host : ""}.ico`;
        break;
      case "Direct":
      default:
        urlString = `${url.scheme}://${url.host ? url.host : ""}/favicon.ico`;
        break;
    }
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={on}
      onClose={close}
    >
      <Box className='icons-manager' m="20px">
        <Typography m="8px 0">默认图标：</Typography>
        <Box border="1px solid #ccc">
          {
            faIcons.map((icon: any) => {
              return (
                <StyledIcon
                  key={icon.iconName}
                  onClick={handleIconClick(icon)}
                  selected={!customIconId && icon.iconName === iconId}
                >
                  <FontAwesomeIcon icon={icon} />
                </StyledIcon>
              );
            })
          }
        </Box>
        <Typography m="8px 0">自定义图标：</Typography>
        <Box border="1px solid #ccc">
          {
            Object.keys(customIcons).map((id: string) => {
              return (
                <StyledIcon key={id}
                  onClick={handleIconClick(id)}
                  selected={customIconId === id}
                >
                  <img
                    src={customIcons[id]}
                  />
                </StyledIcon>
              );
            })
          }
        </Box>
        <TextField
          sx={{ marginTop: '22px' }}
          fullWidth
          placeholder='图标 URL'
          id='accountFormTitle'
          onClick={() => ('title')}
          variant='standard'
          value={props.url}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Button
                  tabIndex={-1}
                  onClick={() => downloadIcon()}
                  size='small'
                  variant="contained"
                  startIcon={<ImageIcon />}
                >
                  上传图标
                </Button>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Button
                  tabIndex={-1}
                  onClick={() => downloadIcon()}
                  size='small'
                >
                  下载图标
                </Button>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Dialog >
  );

}

export default React.memo(IconsManager)
