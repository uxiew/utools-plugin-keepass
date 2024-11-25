import {
  CircularProgress,
  CircularProgressProps
} from '@mui/material/';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const TOTAL_PROGRESS = 100

export default function TOTPTimer(
  props: CircularProgressProps & {
    value: number,
    indicator: number,
  }
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: props.size, height: props.size }}>
      <CircularProgress variant="determinate" size={24} thickness={4} {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >
          {Math.round(props.indicator)}
        </Typography>
      </Box>
    </Box>
  );
}
