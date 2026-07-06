import type React from 'react';

import { formatMonthCaption } from './calendar-month';
import { formatISO } from './date-utils';
import type { UiCalendarMultiSelectProps } from './types';
import { useCalendarActions } from './use-calendar-actions';
import { useCalendarModel } from './use-calendar-model';
import { useRovingFocus } from './use-roving-focus';
import { buildCellRows, type CellDescriptor } from './view-model';

export interface CalendarController {
  rovingRef: (node: HTMLElement | null) => void;
  caption: string;
  cellRows: CellDescriptor[][];
  /** Polite live-region text; non-empty only after button-driven month changes. */
  monthAnnouncement: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (iso: string) => void;
  onGridKeyDown: (event: React.KeyboardEvent) => void;
}

// Composes the calendar's state, roving focus and action handlers into the flat
// controller the component renders from.
export function useCalendar(props: UiCalendarMultiSelectProps): CalendarController {
  const model: ReturnType<typeof useCalendarModel> = useCalendarModel(props);
  const focus: ReturnType<typeof useRovingFocus> = useRovingFocus();
  const actions: ReturnType<typeof useCalendarActions> = useCalendarActions(props, model, focus);

  const cellRows: CellDescriptor[][] = buildCellRows({
    visibleMonth: model.visibleMonth,
    selected: model.selectedSet,
    focusedISO: model.focusedISO,
    todayISO: formatISO(model.today),
    minISO: model.minISO,
    maxISO: model.maxISO,
  });

  return {
    rovingRef: focus.rovingRef,
    caption: formatMonthCaption(model.visibleMonth),
    cellRows,
    monthAnnouncement: model.announcement,
    onPrevMonth: actions.onPrevMonth,
    onNextMonth: actions.onNextMonth,
    onDayClick: actions.onDayClick,
    onGridKeyDown: actions.onGridKeyDown,
  };
}
