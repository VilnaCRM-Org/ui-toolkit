import type { SxProps, Theme } from '@mui/material';
import type { ReactNode } from 'react';

/**
 * Shared contract support:
 * - supported: sx, disabled
 * - exceptions: value, onChange, error, size, variant
 */
export interface UiLinkProps {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
  sx?: SxProps<Theme>;
  /**
   * Renders the link in Board A's Disabled column state. The anchor keeps its
   * `href` — and therefore its `link` role and accessible name — but is flagged
   * `aria-disabled="true"`, taken out of the keyboard tab order
   * (`tabIndex={-1}`), and its activation is suppressed, so clicking it does not
   * navigate. The `rel`/new-tab contract is unaffected by `disabled`.
   */
  disabled?: boolean;
  /**
   * Visually-hidden hint appended when the link opens in a new tab
   * (`target="_blank"`). Pass a localized string; set to `''` to suppress
   * (e.g. when the consumer renders its own external-link affordance).
   */
  newTabLabel?: string;
}
