import { SxProps, Theme } from '@mui/material';

/**
 * Shared contract support:
 * - supported: sx
 * - exceptions: value, onChange, disabled, error, size, variant
 */
export interface UiLinkProps {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
  sx?: SxProps<Theme>;
}
