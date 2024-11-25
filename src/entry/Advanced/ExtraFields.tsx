import { Box, Button, Divider, Stack, TextField } from "@mui/material"
import { Add as AddIcon } from "@mui/icons-material"
import type { T_Entry } from "../../typings/data"
import type { ProtectedValue } from "kdbxweb"
import "./ExtraFields.scss"

type Props = {
  fields: T_Entry['extraFields']
}

// otp 值为 ProtectedValue 类型
function getValue(value: string | ProtectedValue) {
  return typeof value === 'string' ? value : value.getText()
}

export default function ExtraFields(props: Props) {
  const { fields } = props
  const changeFieldValue = (key: string) => {

  }

  return <Box className="entry-form-extrafields">
    <Divider textAlign="left" sx={{ marginBottom: "20px" }}>附加属性 🗞️</Divider>
    {
      Object.keys(fields).length > 0 && Object.keys(fields).map(fieldKey => <TextField
        key={fieldKey}
        fullWidth
        label={fieldKey}
        value={getValue(fields[fieldKey])}
        onChange={() => changeFieldValue(fieldKey)}
        InputLabelProps={{ shrink: true }}
        sx={{
          "input": {
            padding: "10px"
          }
        }}
        variant='outlined'
      />)
    }
    <Stack direction="row" justifyContent="right" p="20px 0">
      <Button variant="outlined" startIcon={<AddIcon />}>
        添加
      </Button>
    </Stack>
  </Box>
}
