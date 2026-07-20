import { LinearProgress } from '@mui/material';
import React from 'react';

import styles from './styles';

export interface UploadProgressProps {
  value: number | undefined;
  label: string;
}

// An out-of-range, missing or non-finite percentage degrades to "no progress"
// rather than a broken control. NaN matters in practice: `loaded / total * 100`
// is NaN when a response has no Content-Length, and Math.min/Math.max would
// propagate it into a *full* bar and `aria-valuenow="NaN"`.
function clampPercent(value: number | undefined): number {
  const percent: number = Number(value);
  return Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
}

/**
 * Determinate progress bar for a long-running upload. MUI gives it
 * `role="progressbar"` with `aria-valuenow`, so a screen-reader user can query
 * how far along the upload is at any moment — which is why the live region
 * deliberately does not narrate every percentage tick.
 */
function UploadProgress({ value, label }: UploadProgressProps): React.ReactElement {
  return (
    <LinearProgress
      variant="determinate"
      value={clampPercent(value)}
      aria-label={label}
      sx={styles.progress}
    />
  );
}

export default UploadProgress;
