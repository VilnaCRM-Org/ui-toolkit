import { Box } from '@mui/material';
import React from 'react';

import DayCell from './day-cell';
import PaddingCell from './padding-cell';
import rowBandBackground from './range-band';
import { dayRowSx, rowGroupSx } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';
import type { CellDescriptor } from './view-model';

export interface CalendarBodyProps {
  field: CalendarField;
  calendar: CalendarController;
}

interface CellContext {
  interactive: boolean;
  rovingRef: (node: HTMLElement | null) => void;
  onDayClick: (iso: string) => void;
}

function renderCell(cell: CellDescriptor, ctx: CellContext): React.ReactElement {
  if (cell.kind === 'padding') {
    return <PaddingCell key={cell.key} dayNumber={cell.dayNumber} />;
  }
  return (
    <DayCell
      key={cell.iso}
      day={cell}
      interactive={ctx.interactive}
      cellRef={cell.roving ? ctx.rovingRef : undefined}
      onDayClick={ctx.onDayClick}
    />
  );
}

// The six week rows of the month grid, each carrying its slice of the range band.
function CalendarBody({ field, calendar }: Readonly<CalendarBodyProps>): React.ReactElement {
  const ctx: CellContext = {
    interactive: !field.disabled,
    rovingRef: calendar.rovingRef,
    onDayClick: calendar.onDayClick,
  };
  return (
    <Box role="rowgroup" sx={rowGroupSx}>
      {calendar.cellRows.map(row => (
        <Box role="row" key={row.key} sx={dayRowSx(rowBandBackground(row.cells))}>
          {row.cells.map(cell => renderCell(cell, ctx))}
        </Box>
      ))}
    </Box>
  );
}

export default CalendarBody;
