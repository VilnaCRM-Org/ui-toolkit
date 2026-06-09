import type { ReactNode } from 'react';
import { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: sx
 * - exceptions: value, onChange, disabled, error, size, variant
 */
export interface UiLinkProps {
  children: ReactNode;
  href: string;
  target?: string;
  rel?: string;
  sx?: SxProps<Theme>;
  /**
   * Visually-hidden hint appended when the link opens in a new tab
   * (`target="_blank"`). Pass a localized string; set to `''` to suppress
   * (e.g. when the consumer renders its own external-link affordance).
   */
  newTabLabel?: string;
}
