import React from 'react';

import { initialFocus, initialMonth, toBoundISO } from './calendar-init';
import { sanitizeSelection } from './selection';
import type { UiCalendarMultiSelectProps } from './types';

// The calendar's reactive state: normalised selection, the (uncontrolled) visible
// month, the roving-focus day, and the month announcer text. Kept separate from
// the action handlers so each file stays within the module-size budget.
export interface CalendarModel {
  today: Date;
  selectedSorted: string[];
  selectedSet: Set<string>;
  minISO?: string;
  maxISO?: string;
  visibleMonth: Date;
  setVisibleMonth: (month: Date) => void;
  focusedISO: string;
  setFocusedISO: (iso: string) => void;
  announcement: string;
  setAnnouncement: (message: string) => void;
}

export function useCalendarModel(props: UiCalendarMultiSelectProps): CalendarModel {
  const { value, defaultMonth, minDate, maxDate } = props;

  const today: Date = React.useMemo<Date>(() => new Date(), []);
  const selectedSorted: string[] = React.useMemo<string[]>(() => sanitizeSelection(value), [value]);
  const selectedSet: Set<string> = React.useMemo<Set<string>>(
    () => new Set(selectedSorted),
    [selectedSorted]
  );

  const [visibleMonth, setVisibleMonth] = React.useState<Date>(() =>
    initialMonth(defaultMonth, selectedSorted[0], today)
  );
  const [focusedISO, setFocusedISO] = React.useState<string>(() =>
    initialFocus({
      visibleMonth: initialMonth(defaultMonth, selectedSorted[0], today),
      selectedSorted,
      today,
      minISO: toBoundISO(minDate),
      maxISO: toBoundISO(maxDate),
    })
  );
  const [announcement, setAnnouncement] = React.useState<string>('');

  return {
    today,
    selectedSorted,
    selectedSet,
    minISO: toBoundISO(minDate),
    maxISO: toBoundISO(maxDate),
    visibleMonth,
    setVisibleMonth,
    focusedISO,
    setFocusedISO,
    announcement,
    setAnnouncement,
  };
}
