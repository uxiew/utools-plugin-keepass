import { List, Divider, IconButton, ListItem, Popover, ListItemText, ListItemIcon, Button, TableHead, TableContainer, Table, TableRow, TableCell, TableBody, Paper, Box, Stack, Typography, Tooltip } from "@mui/material"
import {
  Image as ImageIcon,
  DescriptionOutlined as TextIcon,
  InsertDriveFileOutlined as OtherFileIcon,
  FileOpen as FileOpenIcon,
  Save as SaveIcon,
  Delete as DeleteIcon
} from "@mui/icons-material"
import { useSetState } from "ahooks"
import { MouseEvent, useRef } from "react"
import { getFileSize, getFileType, readFileAsync } from "../../utils/utils"
import AttachmentModel from "../../../utools/keepass/Attachment"
import "./Attachment.scss"

interface Props {
  attachments: AttachmentModel[]
}

function getFullTitle(file: AttachmentModel) {
  return file.title
}

function getFileIcon(file: AttachmentModel) {
  return getFileType(file) === 'text'
    ? <TextIcon /> : getFileType(file) === 'image'
      ? <ImageIcon /> : <OtherFileIcon />
}

export default function Attachments(props: Props) {

  const { attachments } = props;
  const AttachmentRef = useRef<HTMLHRElement>(null)
  const [viewState, setViewState] = useSetState({
    fileType: '',
    content: ''
  })
  console.log("xxAttachments", props)

  const showAttachmentContent = (file: AttachmentModel) => {
    makeContentView(
      getFileType(file),
      new Blob([file.getBinary()], { type: file.mimeType })
    )
  }

  const makeContentView = async (fileType: string, blob: Blob) => {
    console.log(blob)
    switch (fileType) {
      case 'text': {
        setViewState({
          fileType,
          content: await readFileAsync(blob)
        })
        break;
      }
      case 'image':
        setViewState({
          fileType,
          content: URL.createObjectURL(blob)
        })
        break;
      default:
        setViewState({
          fileType,
          content: '对不起，该类型不支持直接显示！'
        })
    }
  }

  const deleteAttachment = (file: AttachmentModel, e: MouseEvent) => {
  }
  const saveAttachment = (file: AttachmentModel, e: MouseEvent) => {
  }

  //fa fa-file-image
  return <Box className="entry-form-attachments">
    <Divider textAlign="left" ref={AttachmentRef} sx={{ marginBottom: "20px" }}>附件 📎</Divider>
    {
      attachments.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>文件名</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachments.map((file) => (
                <TableRow key={file.title}>
                  <TableCell component="th" scope="row" sx={{ p: "8px" }}>
                    <Stack direction="row" alignItems="center" sx={{
                      width: "200px",
                      "> svg": {
                        fontSize: "30px",
                        marginRight: "4px"
                      }
                    }}>
                      {getFileIcon(file)}
                      <Typography noWrap title={getFullTitle(file)}>
                        {getFullTitle(file)}
                        <br />
                        {"(" + (getFileSize((file.getBinary().byteLength))) + ")"}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{
                    padding: 0,
                    "> button": {
                      padding: "4px",
                      margin: "1px"
                    }
                  }}>
                    <Tooltip
                      title="查看"
                      placement='top'
                    >
                      <IconButton
                        onClick={() => showAttachmentContent(file)}
                        edge="end"
                        aria-label="open">
                        <FileOpenIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="保存"
                      placement='top'
                    >
                      <IconButton
                        onClick={(e) => saveAttachment(file, e)}
                        edge="end"
                        aria-label="save">
                        <SaveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="删除"
                      placement='top'
                    >
                      <IconButton
                        onClick={(e) => deleteAttachment(file, e)}
                        edge="end"
                        aria-label="delete">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>)
    }
    <Stack direction="row" justifyContent="right" p="20px 0">
      <Button variant="outlined" startIcon={<ImageIcon />} >
        上传
      </Button>
    </Stack>
    <Popover
      open={!!viewState.content}
      anchorEl={AttachmentRef.current}
      onClose={() => setViewState({ content: '' })}
      transformOrigin={{
        vertical: 'center',
        horizontal: 'right'
      }}
      className="entry-form-attachments-view"
    >
      {
        viewState.fileType === 'text'
          ? <pre>{viewState.content}</pre>
          : viewState.fileType === 'image'
            ? <img src={viewState.content} />
            : <p>{viewState.content}</p>
      }
    </Popover>
  </Box >
}
