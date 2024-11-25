import React, { useRef, forwardRef, useImperativeHandle, useState } from "react"
import { Button, Popover } from "@mui/material"
import { Send as SendIcon } from "@mui/icons-material"
import RandomPassword from "../../components/password-generator/RandomPassword"
import "../../styles/EntryRandomPassword.scss"

export interface IRandomPopoverRef {
  showRandom: () => void
}

interface Props {
  rpEl: React.RefObject<HTMLButtonElement>, // randomPassword
}

const EntryRandom = forwardRef<IRandomPopoverRef, Props>(function EntryRandom(props, ref) {
  let randomPasswordRef = useRef<RandomPassword>(null)

  const [showRandom, setShowRandom] = useState(false)

  useImperativeHandle(ref, () => ({
    showRandom() {
      setShowRandom(true)
      setTimeout(() => randomPasswordRef.current?.generateRandom(), 100)
    }
  }), [])

  const generatePasswordOk = () => {
    setShowRandom(false);
    return randomPasswordRef.current?.getPasswordValue()
  };

  return <Popover
    open={showRandom}
    anchorEl={props.rpEl.current}
    onClose={() => setShowRandom(false)}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
  >
    <div className='random-password-popover'>
      <RandomPassword
        from='accountform'
        ref={randomPasswordRef}
      />
      <div className='random-password-popover-footer'>
        <Button
          onClick={generatePasswordOk}
          variant='contained'
          color='primary'
          endIcon={<SendIcon />}
        >
          使用该密码
        </Button>
      </div>
    </div>
  </Popover>
})


export default React.memo(EntryRandom)
