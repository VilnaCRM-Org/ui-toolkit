import type React from 'react';

import { DEFAULT_LOCALE, formatMonthCaption } from './calendar-month';
import { formatISO } from './date-utils';
import type { UiCalendarMultiSelectProps } from './types';
import { useCalendarActions, type CalendarActions } from './use-calendar-actions';
import { useCalendarModel, type CalendarModel } from './use-calendar-model';
import { useRovingFocus, type RovingFocus } from './use-roving-focus';
import { buildCellRows, type CellRow } from './view-model';

export interface CalendarController {
  rovingRef: (node: HTMLElement | null) => void;
  caption: string;
  locale: string;
  cellRows: CellRow[];
  /** Polite live-region text; non-empty only after button-driven month changes. */
  monthAnnouncement: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (iso: string) => void;
  onGridKeyDown: (event: React.KeyboardEvent) => void;
}

// Projects the model's date state onto the view-model's parameter shape. Kept out
// of `useCalendar` so the hook stays within the per-function complexity budget.
function monthCellRows(model: CalendarModel, locale: string): CellRow[] {
  return buildCellRows({
    visibleMonth: model.visibleMonth,
    rangeStartISO: model.selectedSorted[0],
    rangeEndISO: model.selectedSorted[1],
    focusedISO: model.focusedISO,
    todayISO: formatISO(model.today),
    minISO: model.minISO,
    maxISO: model.maxISO,
    locale,
  });
}

// Composes the calendar's state, roving focus and action handlers into the flat
// controller the component renders from.
export function useCalendar(props: UiCalendarMultiSelectProps): CalendarController {
  const model: CalendarModel = useCalendarModel(props);
  const focus: RovingFocus = useRovingFocus();
  const actions: CalendarActions = useCalendarActions(props, model, focus);
  const locale: string = props.locale ?? DEFAULT_LOCALE;

  return {
    rovingRef: focus.rovingRef,
    caption: formatMonthCaption(model.visibleMonth, locale),
    locale,
    cellRows: monthCellRows(model, locale),
    monthAnnouncement: model.announcement,
    onPrevMonth: actions.onPrevMonth,
    onNextMonth: actions.onNextMonth,
    onDayClick: actions.onDayClick,
    onGridKeyDown: actions.onGridKeyDown,
  };
}
