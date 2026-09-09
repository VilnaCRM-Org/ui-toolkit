import { Box } from '@mui/material';
import React from 'react';

import styles, { statusPillSx } from './styles';
import type { UiUploadStatus } from './types';

// Narrowed to the statuses that actually render: the early return below makes an
// `idle` entry unreachable, and an unreachable literal is a mutant no test can kill.
type StartedStatus = Exclude<UiUploadStatus, 'idle'>;

const PILL_TEXT: Readonly<Record<StartedStatus, string>> = {
  uploading: 'Uploading',
  success: 'Uploaded',
  error: 'Upload failed',
};

export interface UploadStatusPillProps {
  status: UiUploadStatus;
}

/**
 * The Figma "Tags" pill reporting the upload lifecycle. It is a persistent,
 * text-bearing echo of what the live region announces once: a user who arrives
 * after the announcement — or who cannot perceive the colour tint — still reads
 * the state as words (WCAG 1.4.1). Idle renders nothing, since "no upload has
 * started" is already what an empty field says.
 */
function UploadStatusPill({ status }: UploadStatusPillProps): React.ReactElement | null {
  if (status === 'idle') {
    return null;
  }

  return (
    <Box sx={statusPillSx(status)}>
      <Box component="span" className="ui-file-upload-dot" sx={styles.statusDot} />
      {PILL_TEXT[status]}
    </Box>
  );
}

export default UploadStatusPill;
