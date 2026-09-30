import type { SxProps, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

import srOnlySx from '../../utils/sr-only';

export const DEFAULT_LOADING_TEXT: string = 'Завантаження';

export interface ComposedSkeletonProps {
  id?: string | undefined;
  /**
   * Screen-reader-only status text; pass a localized string in consuming apps.
   * The skeleton only marks state (`aria-busy` + this hidden text): announcing
   * load completion is the consumer's job via one persistent `role="status"`
   * region per view — skeletons never own live regions.
   */
  loadingText?: string | undefined;
  sx?: SxProps<Theme> | undefined;
  /** Layout styles for the hidden shape tree (flex/grid of the composition). */
  contentSx?: SxProps<Theme> | undefined;
  landmark?: 'section' | undefined;
  children: React.ReactNode;
}

function BusyLabel({
  landmark,
  loadingText,
}: Readonly<{ landmark: 'section' | undefined; loadingText: string }>): React.ReactNode {
  if (landmark === 'section') {
    return null;
  }
  return (
    <Box component="span" sx={srOnlySx}>
      {loadingText}
    </Box>
  );
}

/**
 * Shared shell for composed skeleton layouts: by default a nameless busy div
 * holding the visually-hidden status text and the decorative shape tree, or a
 * named busy `<section>` region when `landmark="section"`.
 */
export default function ComposedSkeleton({
  id,
  loadingText = DEFAULT_LOADING_TEXT,
  sx = [],
  contentSx = [],
  landmark,
  children,
}: Readonly<ComposedSkeletonProps>): React.ReactElement {
  return (
    <Box
      id={id}
      component={landmark ?? 'div'}
      aria-label={landmark ? loadingText : undefined}
      aria-busy="true"
      sx={[...(Array.isArray(sx) ? sx : [sx])]}
    >
      <BusyLabel landmark={landmark} loadingText={loadingText} />
      <Box aria-hidden="true" sx={[...(Array.isArray(contentSx) ? contentSx : [contentSx])]}>
        {children}
      </Box>
    </Box>
  );
}
