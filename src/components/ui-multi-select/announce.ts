import type { UiMultiSelectOption } from './types';

// Builds the polite live-region message for a selection change by diffing the
// previous and next selections. MUI announces nothing on chip add/remove by
// default (Backspace and × removal are silent), so this drives a `role="status"`
// region; the count re-orients the user after an otherwise-silent removal
// (WCAG 4.1.3). Diffing keeps the change handler within the argument budget (no
// need for MUI's 4-ary `reason`/`details` callback signature).

/** The first option present in `from` but absent from `other` (by value). */
function findDelta(
  from: UiMultiSelectOption[],
  other: UiMultiSelectOption[]
): UiMultiSelectOption | undefined {
  return from.find(option => !other.some(candidate => candidate.value === option.value));
}

export function announceChange(prev: UiMultiSelectOption[], next: UiMultiSelectOption[]): string {
  const count: number = next.length;
  // Clearing removes every chip at once (many → none); a single removal that
  // empties the field is announced as a normal removal below.
  if (count === 0 && prev.length > 1) {
    return `Selection cleared, ${count} selected`;
  }
  const added: UiMultiSelectOption | undefined = findDelta(next, prev);
  if (added != null) {
    return `${added.label} added, ${count} selected`;
  }
  const removed: UiMultiSelectOption | undefined = findDelta(prev, next);
  return removed == null ? '' : `${removed.label} removed, ${count} selected`;
}
