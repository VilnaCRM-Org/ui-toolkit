import type { ButtonProps } from '@mui/material/Button';

export type ButtonLinkTarget =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
    };

export interface UiButtonProps extends ButtonProps {
  to?: ButtonLinkTarget;
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
  loadingText?: string;
}
