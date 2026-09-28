import type { ButtonProps } from '@mui/material/Button';
import type React from 'react';

export type ButtonLinkTarget =
  | string
  | {
      pathname?: string | undefined;
      search?: string | undefined;
      hash?: string | undefined;
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
   * reason — the indicator is this kit's shared spinner (`loadingIndicator` is
   * honoured only in the `native` loading mode).
   *
   * The status region is rendered only while `loading` is defined, so a button
   * that never loads adds no empty live region to the page.
   */
  loadingText?: string | undefined;
  /**
   * How `loading` is presented. `'aria-disabled'` (the default) is described on
   * `loadingText`. `'native'` is CRM's submit-button pattern: the button goes
   * natively `disabled` into the grey disabled fill with the label ink hidden and
   * a centred spinner (`loadingIndicator` when given), and renders no status
   * region — the owning form announces the submit. A focused button drops focus
   * when it becomes natively disabled, so use it only where that is accepted.
   */
  loadingMode?: 'aria-disabled' | 'native' | undefined;
}
