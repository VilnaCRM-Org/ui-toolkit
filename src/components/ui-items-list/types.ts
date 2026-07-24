import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * A vertical stack of `UiItemRow`s: a semantic `<ul role="list">` with one `<li>`
 * per row (the row is the `<li>`'s sole child), 8px apart, full width, and no
 * chrome of its own. Composition-based — pass `UiItemRow` elements as children and
 * the list wraps each in a list item; it adds no interactive behaviour.
 *
 * An EMPTY list renders nothing at all (no `<ul>`), so a `list` role never appears
 * for a zero-row collection.
 */
export interface UiItemsListProps {
  /** The `UiItemRow` elements to stack; each is wrapped in its own `<li>`. */
  children?: ReactNode;
  /**
   * Optional accessible name for the list. Not a landmark, so there is no default
   * — omit it unless the surrounding context needs the list named.
   */
  'aria-label'?: string;
  sx?: SxProps<Theme>;
}
