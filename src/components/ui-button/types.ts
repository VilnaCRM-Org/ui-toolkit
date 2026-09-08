import type { ButtonProps } from '@mui/material/Button';
import type React from 'react';

export type ButtonLinkTarget =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
    };

export interface UiButtonProps extends ButtonProps {
  to?: ButtonLinkTarget | undefined;
  /**
   * Browsing context for the link the button renders as. Only meaningful
   * alongside `href`/`to`, which is what makes the root an `<a>`; both this and
   * `rel` were already forwarded to that element at runtime but were missing
   * from the type, so TypeScript consumers had to cast to pass them.
   *
   * `_blank` opens a new tab, which needs `rel="noopener noreferrer"` against
   * reverse tabnabbing — unlike `UiLink`, this component does not add it for
   * you, so pass `rel` yourself.
   */
  target?: React.HTMLAttributeAnchorTarget | undefined;
  /** `rel` for the link the button renders as. See `target`. */
  rel?: string | undefined;
  /**
   * Loading copy spoken by the button's own polite `role="status"` region once a
   * busy state has lasted long enough to be worth announcing. Defaults to
   * `'Завантаження'`.
   *
   * The busy state itself is MUI's inherited `loading` prop, but this control
   * does NOT forward it to MUI: MUI sets `disabled: disabled || loading`, and a
   * focused element that becomes natively disabled drops `document.activeElement`
   * to `<body>` in every browser — losing a keyboard user's place the moment
   * their own activation starts the fetch (SC 2.4.3). `loading` is instead
   * rendered as `aria-disabled` plus a guarded activation path, so the button
   * keeps focus and keeps its accessible name. `loadingIndicator` and
   * `loadingPosition` are inherited from `ButtonProps` but inert for the same
   * reason — the indicator is this kit's shared spinner.
   */
  loadingText?: string | undefined;
}
