import type React from 'react';

import { DEFAULT_LOCALE, formatDayLabel, formatMonthCaption, isSameMonth } from './calendar-month';
import { addMonths, addMonthsKeepDay, formatISO, parseISO, startOfMonth } from './date-utils';
import { SELECT_KEYS, nextFocusedDate } from './keyboard';
import { applyRangeEndpoint } from './selection';
import type { UiCalendarMultiSelectProps } from './types';
import type { CalendarModel } from './use-calendar-model';
import type { RovingFocus } from './use-roving-focus';

// Pure-ish interaction handlers for the calendar. They take a single context so
// no handler exceeds the argument budget, and each stays small enough for the
// complexity gate; state changes flow through the model's setters.
export interface ActionContext {
  props: UiCalendarMultiSelectProps;
  model: CalendarModel;
  focus: RovingFocus;
}

/** Whether a day is within the selectable [min, max] range. Internal to this module. */
function canSelectDay(iso: string, model: CalendarModel): boolean {
  const { minISO, maxISO } = model;
  return (minISO == null || iso >= minISO) && (maxISO == null || iso <= maxISO);
}

// Polite live-region text for the two-step range protocol (WCAG 4.1.3): a pending
// start prompts for the end; a completed range confirms both endpoints. `next`
// always carries one or two endpoints (never empty) as it comes from the reducer.
function rangeAnnouncement(next: string[], locale: string): string {
  const startLabel: string = formatDayLabel(parseISO(next[0]), locale);
  if (next.length === 1) {
    return `Start date ${startLabel} selected, choose an end date`;
  }
  return `Range ${startLabel} to ${formatDayLabel(parseISO(next[1]), locale)} selected`;
}

export function selectDay(ctx: ActionContext, iso: string): void {
  const next: string[] = applyRangeEndpoint(ctx.model.selectedSorted, iso);
  ctx.props.onChange?.(next);
  ctx.model.setFocusedISO(iso);
  ctx.model.setAnnouncement(rangeAnnouncement(next, ctx.props.locale ?? DEFAULT_LOCALE));
}

/** Prev/next month via the nav buttons: focus stays on the button, so announce. */
export function stepMonth(ctx: ActionContext, delta: number): void {
  const next: Date = addMonths(ctx.model.visibleMonth, delta);
  ctx.model.setVisibleMonth(next);
  ctx.model.setFocusedISO(formatISO(addMonthsKeepDay(parseISO(ctx.model.focusedISO), delta)));
  ctx.model.setAnnouncement(formatMonthCaption(next, ctx.props.locale ?? DEFAULT_LOCALE));
}

function moveFocus(ctx: ActionContext, next: Date): void {
  if (!isSameMonth(next, ctx.model.visibleMonth)) {
    ctx.model.setVisibleMonth(startOfMonth(next));
  }
  ctx.model.setFocusedISO(formatISO(next));
}

function trySelectKey(ctx: ActionContext, event: React.KeyboardEvent): boolean {
  if (!SELECT_KEYS.has(event.key)) {
    return false;
  }
  event.preventDefault();
  if (canSelectDay(ctx.model.focusedISO, ctx.model)) {
    selectDay(ctx, ctx.model.focusedISO);
  }
  return true;
}

// The day keyboard focus should move to, or null when the key is not actionable.
// Null cases: a modifier combo (Ctrl/Alt/Meta — left to the browser / AT; Shift is
// allowed, it steps a year), a non-navigation key, and a week-edge Home/End that
// resolves to the same day. Bailing on that no-op is what keeps a later prev/next
// month-button click from losing focus: arming the roving-focus flag on a no-op
// leaves it stuck (React's same-value setFocusedISO never re-invokes the ref).
function navigationTarget(ctx: ActionContext, event: React.KeyboardEvent): Date | null {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return null;
  }
  const next: Date | null = nextFocusedDate(
    event.key,
    parseISO(ctx.model.focusedISO),
    event.shiftKey
  );
  if (next == null || formatISO(next) === ctx.model.focusedISO) {
    return null;
  }
  return next;
}

function tryNavigateKey(ctx: ActionContext, event: React.KeyboardEvent): void {
  const next: Date | null = navigationTarget(ctx, event);
  if (next == null) {
    return;
  }
  event.preventDefault();
  ctx.focus.requestFocus(); // focus follows keyboard navigation
  ctx.model.setAnnouncement(''); // the newly focused cell self-announces
  moveFocus(ctx, next);
}

// Escape cancels a PENDING range (one endpoint chosen, awaiting the second): it
// clears the pending start and stays put. With nothing pending it is a no-op that
// bubbles, so a containing dialog can still close on Escape (no 2.1.2 trap).
function tryCancelKey(ctx: ActionContext, event: React.KeyboardEvent): boolean {
  if (event.key !== 'Escape' || ctx.model.selectedSorted.length !== 1) {
    return false;
  }
  event.preventDefault();
  event.stopPropagation();
  ctx.props.onChange?.([]);
  ctx.model.setAnnouncement('Range selection cancelled');
  return true;
}

export function handleGridKey(ctx: ActionContext, event: React.KeyboardEvent): void {
  if (ctx.props.disabled) {
    return;
  }
  if (tryCancelKey(ctx, event)) {
    return;
  }
  if (trySelectKey(ctx, event)) {
    return;
  }
  tryNavigateKey(ctx, event);
}
