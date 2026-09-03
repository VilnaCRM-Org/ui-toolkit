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
}
