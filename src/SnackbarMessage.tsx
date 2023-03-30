import React, { SyntheticEvent } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';

interface SnackbarMessageProps {
  message: { key: number; type: AlertColor; body: string };
}

export default class SnackbarMessage extends React.Component<SnackbarMessageProps> {
  state = {
    open: false
  };

  componentDidUpdate(prevProps: SnackbarMessageProps) {
    if (prevProps.message !== this.props.message) {
      this.setState({ open: true });
    }
  }

  handleClose = (
    _event: Event | SyntheticEvent<any, Event>,
    reason?: string
  ) => {
    if (reason === 'clickaway') return;
    this.setState({ open: false });
  };

  render() {
    const { open } = this.state;
    const { key, type, body } = this.props.message;

    return (
      <Snackbar
        key={key}
        open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={this.handleClose}
      >
        <Alert onClose={this.handleClose} variant='filled' severity={type}>
          {body}
        </Alert>
      </Snackbar>
    );
  }
}
