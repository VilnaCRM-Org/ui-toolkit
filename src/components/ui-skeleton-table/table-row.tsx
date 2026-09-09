import type { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import type { SystemStyleObject } from '@mui/system';
import React from 'react';

import UiSkeletonBlock from '../ui-skeleton-block';
import { getSkeletonKeys } from '../ui-skeletons';

import { DOT_RADIUS, GLYPH_DOTS, GLYPH_DOT_SIZE, getCellStyles, glyphStyles } from './styles';
import SkeletonTableCell from './table-cell';
import type { SkeletonTableColumnSlot } from './types';

interface SkeletonTableRowProps {
  slots: SkeletonTableColumnSlot[];
  sx: SystemStyleObject<Theme>;
  glyph?: boolean;
}

/** Placeholder for the trailing `dots-vertical` row action glyph. */
function RowGlyph(): React.ReactElement {
  return (
    <Box sx={glyphStyles}>
      {getSkeletonKeys('glyph-dot', GLYPH_DOTS).map(key => (
        <UiSkeletonBlock
          key={key}
          width={GLYPH_DOT_SIZE}
          height={GLYPH_DOT_SIZE}
          borderRadius={DOT_RADIUS}
        />
      ))}
    </Box>
  );
}

/**
 * One column-aligned row of placeholder shapes. Header and body rows share this
 * builder so the two stay on the same tracks and neither grows a table role.
 */
export default function SkeletonTableRow({
  slots,
  sx,
  glyph = false,
}: Readonly<SkeletonTableRowProps>): React.ReactElement {
  return (
    <Box sx={sx}>
      {slots.map(slot => (
        <Box key={slot.key} sx={getCellStyles(slot.track)}>
          <SkeletonTableCell column={slot} />
        </Box>
      ))}
      {glyph ? <RowGlyph /> : null}
    </Box>
  );
}
