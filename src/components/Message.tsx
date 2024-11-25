import { memo, SyntheticEvent, useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useSetState } from 'ahooks'
import type { AlertColor } from '@mui/material/Alert';
import { shallow } from 'zustand/shallow';

export interface MessageProps {
  message: { type: AlertColor; body: string } | null;
}

let keyid = 0;
function SnackbarMessage(props: MessageProps) {
  const [state, setState] = useSetState({
    open: false
  })
  const { message } = props
  useEffect(() => {
    // if (prevProps.message !== props.message) {
    if (message) {
      setState({ open: true });
    }
  }, [])

  const handleClose = (
    _event: Event | SyntheticEvent<any, Event>,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    setState({ open: false });

  };

  if (!message) return null;

  return (
    <Snackbar
      key={keyid++}
      open={state.open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} variant='filled' severity={message.type}>
        {message.body}
      </Alert>
    </Snackbar>
  );
}


export default memo(SnackbarMessage, (prevProps, props) => {
  // console.log("xxxMessage", prevProps, props, shallow(prevProps.message, props.message))
  return

})
