import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Shared contract support:
 * - supported: sx, disabled
 * - exceptions: value, onChange, error, size, variant
 */
export type UiLinkProps = {
  children: ReactNode;
  href: string;
  rel?: string | undefined;
  sx?: SxProps<Theme> | undefined;
  /**
   * Renders the link in Board A's Disabled column state. The anchor keeps its
   * `href` — and therefore its `link` role and accessible name — but is flagged
   * `aria-disabled="true"`, taken out of the keyboard tab order
   * (`tabIndex={-1}`), and its activation is suppressed, so clicking it does not
   * navigate. The `rel`/new-tab contract is unaffected by `disabled`.
   */
  disabled?: boolean | undefined;
} & (
  | {
      target: '_blank';
      /**
       * Visually-hidden hint appended when the link opens in a new tab. Required
       * with `target="_blank"`: pass the application's already-translated string.
       * Pass `''` to render no cue (e.g. when the consumer renders its own
       * external-link affordance).
       */
      newTabLabel: string;
    }
  | {
      target?: '_self' | '_parent' | '_top' | undefined;
      newTabLabel?: string | undefined;
    }
);
