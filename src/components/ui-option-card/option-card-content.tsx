import { Box } from '@mui/material';
import React from 'react';

import { BOX_CLASS, CAPTION_CLASS, VALUE_CLASS, boxSx, captionSx, valueSx } from './styles';

// The visible content shared by the wired (radio button) and static shells — ONE
// DOM tree, identical reading order. The accessible name is content-derived: the
// caption span, a literal space text node, then the value box — without the space
// the name would concatenate as "Analytics APIReporting".
export interface OptionCardContentProps {
  label: string;
  valueLabel: string;
}

export function OptionCardContent({
  label,
  valueLabel,
}: Readonly<OptionCardContentProps>): React.ReactElement {
  return (
    <>
      <Box component="span" className={CAPTION_CLASS} sx={captionSx}>
        {label}
      </Box>{' '}
      <Box component="span" className={BOX_CLASS} sx={boxSx}>
        <Box component="span" className={VALUE_CLASS} sx={valueSx}>
          {valueLabel}
        </Box>
      </Box>
    </>
  );
}
