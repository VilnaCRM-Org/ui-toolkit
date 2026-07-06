import type React from 'react';

import { handleGridKey, selectDay, stepMonth, type ActionContext } from './calendar-actions';
import type { UiCalendarMultiSelectProps } from './types';
import type { CalendarModel } from './use-calendar-model';
import type { RovingFocus } from './use-roving-focus';

export interface CalendarActions {
  onDayClick: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGridKeyDown: (event: React.KeyboardEvent) => void;
}

// Binds the pure action handlers to the current model/focus context. The context
// is rebuilt per render so handlers always see fresh state (no stale closures).
export function useCalendarActions(
  props: UiCalendarMultiSelectProps,
  model: CalendarModel,
  focus: RovingFocus
): CalendarActions {
  const ctx: ActionContext = { props, model, focus };
  return {
    onDayClick: (iso: string): void => selectDay(ctx, iso),
    onPrevMonth: (): void => stepMonth(ctx, -1),
    onNextMonth: (): void => stepMonth(ctx, 1),
    onGridKeyDown: (event: React.KeyboardEvent): void => handleGridKey(ctx, event),
  };
}
