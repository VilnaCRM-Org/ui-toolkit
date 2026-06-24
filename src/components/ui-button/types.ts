import type { ButtonProps } from '@mui/material/Button';

type ButtonLinkTarget =
  | string
  | {
      pathname?: string;
      search?: string;
      hash?: string;
    };

export interface UiButtonProps extends ButtonProps {
  to?: ButtonLinkTarget;
}
