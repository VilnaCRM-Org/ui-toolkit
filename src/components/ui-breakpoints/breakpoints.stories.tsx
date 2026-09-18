import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { fontFamilies } from '@/utils/font-tokens';

import { crmBreakpointValues, heightBreakpoints, websiteBreakpointValues } from './index';

type WidthKey = keyof typeof websiteBreakpointValues;
type HeightKey = keyof typeof heightBreakpoints;

const TABLE_SX = { maxWidth: 480, '& th, & td': { fontFamily: fontFamilies.inter } } as const;
const WIDTH_KEYS: WidthKey[] = Object.keys(websiteBreakpointValues) as WidthKey[];
const HEIGHT_KEYS: HeightKey[] = Object.keys(heightBreakpoints) as HeightKey[];

function renderWidthRow(key: WidthKey): React.ReactElement {
  return (
    <TableRow key={key}>
      <TableCell component="th" scope="row">
        {key}
      </TableCell>
      <TableCell align="right">{websiteBreakpointValues[key]}px</TableCell>
      <TableCell align="right">{crmBreakpointValues[key]}px</TableCell>
    </TableRow>
  );
}

function renderHeightRow(key: HeightKey): React.ReactElement {
  return (
    <TableRow key={key}>
      <TableCell component="th" scope="row">
        {key}
      </TableCell>
      <TableCell align="right">{heightBreakpoints[key]}px</TableCell>
    </TableRow>
  );
}

function BreakpointTables(): React.ReactElement {
  return (
    <>
      <Table aria-label="Width breakpoints" sx={TABLE_SX}>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell align="right">websiteBreakpointValues</TableCell>
            <TableCell align="right">crmBreakpointValues</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{WIDTH_KEYS.map(renderWidthRow)}</TableBody>
      </Table>
      <Table aria-label="Height breakpoints" sx={{ ...TABLE_SX, mt: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Key</TableCell>
            <TableCell align="right">heightBreakpoints</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{HEIGHT_KEYS.map(renderHeightRow)}</TableBody>
      </Table>
    </>
  );
}

const meta: Meta<typeof BreakpointTables> = {
  title: 'UiComponents/UiBreakpoints',
  component: BreakpointTables,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Breakpoints: Story = {};
