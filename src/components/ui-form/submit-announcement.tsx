import { Box } from '@mui/material';
import React from 'react';
import type { FieldValues } from 'react-hook-form';

import { DEFAULT_LOADING_TEXT, srOnlySx } from '../field-controls';

import type { FormViewProps } from './types';

export default function SubmitAnnouncement<T extends FieldValues>({
  view,
  submitting,
}: Readonly<{ view: FormViewProps<T>; submitting: boolean }>): React.ReactElement | null {
  if (view.submitLoadingMode !== 'native') {
    return null;
  }
  const announced: boolean = view.submittingAnnouncement ?? submitting;
  return (
    <Box role="status" aria-atomic="true" sx={srOnlySx}>
      {announced ? (view.submittingLabel ?? DEFAULT_LOADING_TEXT) : ''}
    </Box>
  );
}
