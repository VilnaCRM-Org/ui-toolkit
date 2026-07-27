import { Box, Typography } from '@mui/material';
import React from 'react';

import { crmBreakpointValues } from '@/components/ui-breakpoints';

import { PAGINATION_GROUP, UPLOAD_GROUP } from './pagination-upload-groups';
import { CALENDAR_GROUP, RADIO_GROUP } from './radio-calendar-groups';
import { SEARCH_GROUP } from './search-group';
import { MULTISELECT_GROUP, SELECT_GROUP } from './select-groups';
import type { GroupSpec } from './types';

const MOBILE_MAX = `@media (max-width: ${crmBreakpointValues.sm}px)` as const;

const GROUPS: GroupSpec[] = [
  SEARCH_GROUP,
  SELECT_GROUP,
  MULTISELECT_GROUP,
  RADIO_GROUP,
  CALENDAR_GROUP,
  PAGINATION_GROUP,
  UPLOAD_GROUP,
];

const pageSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3rem',
  padding: '2.5rem',
  [MOBILE_MAX]: { padding: '1rem', gap: '2rem' },
  backgroundColor: '#FBFBFB',
  fontFamily: 'Inter',
} as const;
const groupTitleSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '1rem',
  color: '#1A1C1E',
  marginBottom: '1.25rem',
} as const;
const rowSx = { display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' } as const;
const itemBaseSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
} as const;
const tallSx = { position: 'relative', minHeight: '340px' } as const;
const stateLabelSx = {
  fontFamily: 'Inter',
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#969B9D',
} as const;

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

export default function Board(): React.ReactElement {
  return (
    <Box sx={pageSx}>
      {GROUPS.map(group => (
        <Group key={group.title} title={group.title} width={group.width} states={group.states} />
      ))}
    </Box>
  );
}
