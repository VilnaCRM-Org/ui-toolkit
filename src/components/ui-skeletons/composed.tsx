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
  sx?: SxProps<Theme>;
  /** Layout styles for the hidden shape tree (flex/grid of the composition). */
  contentSx?: SxProps<Theme>;
  children: React.ReactNode;
}

/**
 * Shared shell for composed skeleton layouts: a plain busy container (no
 * landmark, label, or widget role — a generic element must stay nameless)
 * holding the visually-hidden status text and the decorative shape tree.
 */
export default function ComposedSkeleton({
  id,
  loadingText = DEFAULT_LOADING_TEXT,
  sx = [],
  contentSx = [],
  children,
}: Readonly<ComposedSkeletonProps>): React.ReactElement {
  return (
    <Box id={id} aria-busy="true" sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      <Box component="span" sx={srOnlySx}>
        {loadingText}
      </Box>
      <Box aria-hidden="true" sx={[...(Array.isArray(contentSx) ? contentSx : [contentSx])]}>
        {children}
      </Box>
    </Box>
  );
}
