import { Box } from '@mui/material';
import React from 'react';

import DayCell from './day-cell';
import PaddingCell from './padding-cell';
import type { CalendarSize } from './styles';
import type { CalendarController } from './use-calendar';
import type { CalendarField } from './use-calendar-field';
import type { CellDescriptor } from './view-model';

export interface CalendarBodyProps {
  field: CalendarField;
  calendar: CalendarController;
}

interface CellContext {
  size: CalendarSize;
  interactive: boolean;
  rovingRef: (node: HTMLElement | null) => void;
  onDayClick: (iso: string) => void;
}

function renderCell(cell: CellDescriptor, ctx: CellContext): React.ReactElement {
  if (cell.kind === 'padding') {
    return <PaddingCell key={cell.key} size={ctx.size} />;
  }
  return (
    <DayCell
      key={cell.iso}
      day={cell}
      size={ctx.size}
      interactive={ctx.interactive}
      cellRef={cell.roving ? ctx.rovingRef : undefined}
      onDayClick={ctx.onDayClick}
    />
  );
}

// The six week rows of the month grid.
function CalendarBody({ field, calendar }: Readonly<CalendarBodyProps>): React.ReactElement {
  const ctx: CellContext = {
    size: field.size,
    interactive: !field.disabled,
    rovingRef: calendar.rovingRef,
    onDayClick: calendar.onDayClick,
  };
  return (
    <Box component="tbody" role="rowgroup">
      {calendar.cellRows.map(row => (
        <Box component="tr" role="row" key={row.key}>
          {row.cells.map(cell => renderCell(cell, ctx))}
        </Box>
      ))}
    </Box>
  );
}

export default CalendarBody;
