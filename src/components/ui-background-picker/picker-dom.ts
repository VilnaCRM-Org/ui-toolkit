import type { PickerFocusIntent } from './picker-refs';

// Rows are found by role rather than a roving tabindex (the menu contributes
// zero tab stops), and are descendants of the `role="menu"` element.
const ROW_SELECTOR: string = '[role="menuitemradio"]';

function rowsOf(menu: HTMLElement | null): HTMLElement[] {
  if (menu == null) {
    return [];
  }
  return Array.from(menu.querySelectorAll<HTMLElement>(ROW_SELECTOR));
}

function wrapIndex(index: number, count: number): number {
  if (count === 0) {
    return 0;
  }
  return ((index % count) + count) % count;
}

function focusRowAt(menu: HTMLElement | null, index: number): void {
  const rows: HTMLElement[] = rowsOf(menu);
  rows[wrapIndex(index, rows.length)]?.focus();
}

/** Focuses the first or last row — the open transition and Home/End both use it. */
export function focusMenuEdge(menu: HTMLElement | null, intent: PickerFocusIntent): void {
  const rows: HTMLElement[] = rowsOf(menu);
  focusRowAt(menu, intent === 'last' ? rows.length - 1 : 0);
}

function isActiveRow(row: HTMLElement): boolean {
  return row === document.activeElement;
}

/** Moves focus by `delta` rows, wrapping. `delta` is +1 (down) or -1 (up). */
export function moveMenuFocus(menu: HTMLElement | null, delta: number): void {
  const rows: HTMLElement[] = rowsOf(menu);
  const current: number = rows.findIndex(isActiveRow);
  focusRowAt(menu, (current < 0 ? 0 : current) + delta);
}
