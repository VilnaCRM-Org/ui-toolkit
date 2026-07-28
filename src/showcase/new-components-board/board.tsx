import { Box, Typography } from '@mui/material';
import React from 'react';

import { GROUPS } from './groups';
import { groupTitleSx, itemBaseSx, pageSx, rowSx, stateLabelSx, tallSx } from './styles';
import type { GroupSpec } from './types';

function StateItem({
  label,
  width,
  tall,
  children,
}: Readonly<{
  label: string;
  width: number;
  tall?: boolean;
  children: React.ReactNode;
}>): React.ReactElement {
  const sizing = { width: `${width}px`, maxWidth: '100%', boxSizing: 'border-box' } as const;
  return (
    <Box sx={{ ...itemBaseSx, ...sizing, ...(tall ? tallSx : {}) }}>
      <Typography component="span" sx={stateLabelSx}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function Group({ title, width, states }: Readonly<GroupSpec>): React.ReactElement {
  return (
    <Box component="section">
      <Typography component="h3" sx={groupTitleSx}>
        {title}
      </Typography>
      <Box sx={rowSx}>
        {states.map(state => (
          <StateItem
            key={state.label}
            label={state.label}
            width={state.width ?? width}
            tall={state.tall}
          >
            {state.node}
          </StateItem>
        ))}
      </Box>
    </Box>
  );
}

export function Board(): React.ReactElement {
  return (
    <Box sx={pageSx}>
      {GROUPS.map(group => (
        <Group key={group.title} title={group.title} width={group.width} states={group.states} />
      ))}
    </Box>
  );
}
