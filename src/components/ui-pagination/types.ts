import type { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: value, onChange, disabled, sx
 * - documented exceptions:
 *   - `value` is the **1-based current page number** (not the shared "selected
 *     value string"): a pagination bar has an inherently numeric position, so
 *     the contract's `value` carries a `number` and `onChange` emits the next
 *     page `number`. There is no "empty" position, so `value` is required.
 *   - `error` / `required` are N/A — a page navigator has no validation state.
 *   - `size` / `variant` are N/A — the Figma control is a single fixed 48px cell
 *     with no size or visual-variant axis.
 *
 * A page navigator built from real `<button>` elements inside a `<nav>`
 * landmark. It is **always controlled**: the current page comes from `value` and
 * the next page must be fed back via `onChange`. The visible page window
 * (boundary/sibling pages and the start/end ellipses) is derived from `count`,
 * `siblingCount` and `boundaryCount` using MUI `usePagination` semantics.
 *
 * Control-level accessibility (the `<nav>` accessible name, `aria-current="page"`
 * on the current page, and native button activation/focus) is owned here;
 * page-fetching and URL/router state belong to the consuming view, not this
 * primitive.
 */
export interface UiPaginationProps {
  /** Current page, 1-based. Always controlled — feed the next page back via `onChange`. */
  value: number;
  /** Total number of pages (`>= 1`). */
  count: number;
  /** Called with the newly selected page number whenever the page changes. */
  onChange?: (page: number) => void;
  /** Disables the whole navigator (every page cell and both prev/next links). */
  disabled?: boolean;
  /** Number of always-visible pages at the start and end of the range. Defaults to `1`. */
  boundaryCount?: number;
  /** Number of pages shown on each side of the current page. Defaults to `1`. */
  siblingCount?: number;
  /** Visible/accessible label for the previous-page link. Defaults to `'Попередня'`. */
  previousLabel?: string;
  /** Visible/accessible label for the next-page link. Defaults to `'Наступна'`. */
  nextLabel?: string;
  /** Accessible name for the `<nav>` landmark. Defaults to `'Пагінація'`. */
  'aria-label'?: string;
  sx?: SxProps<Theme>;
}
