import { Box } from '@mui/material';
import React from 'react';

import { dayCellSx, dayCircleSx } from './styles';
import type { DayDescriptor } from './view-model';

export interface DayCellProps {
  day: DayDescriptor;
  /** `false` when the whole calendar is disabled — cells become non-tabbable no-ops. */
  interactive: boolean;
  /** Set only on the roving cell so keyboard navigation can move focus to it. */
  cellRef?: React.Ref<HTMLElement>;
  onDayClick: (iso: string) => void;
}

// One operable day gridcell. Selection/disabled/today/roving were all decided in
// the pure view-model, so this stays a thin attribute map.
function DayCell({
  day,
  interactive,
  cellRef,
  onDayClick,
}: Readonly<DayCellProps>): React.ReactElement {
  const selectable: boolean = interactive && !day.disabled;
  const handleClick = (): void => onDayClick(day.iso);

  return (
    <Box
      role="gridcell"
      ref={cellRef}
      tabIndex={interactive && day.roving ? 0 : -1}
      aria-selected={day.disabled ? undefined : day.selected}
      aria-current={day.today ? 'date' : undefined}
      aria-disabled={day.disabled ? true : undefined}
      aria-label={day.label}
      onClick={selectable ? handleClick : undefined}
      sx={dayCellSx(day)}
    >
      <Box component="span" className="ui-day-circle" sx={dayCircleSx(day)}>
        {day.dayNumber}
      </Box>
    </Box>
  );
}

export default DayCell;
