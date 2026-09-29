import type { SxProps, Theme } from '@mui/material';

import { useUiTheme } from '@/utils/ui-theme';

import { buttonSx } from './styles';
import type { ButtonSxState, ButtonVariantProps } from './variant-styles';

export default function useButtonSx(
  rest: ButtonVariantProps & { sx?: SxProps<Theme> | undefined },
  busy: boolean,
  appearance: Pick<ButtonSxState, 'native' | 'focusOutline'>
): SxProps<Theme> {
  const theme: Theme = useUiTheme();
  return buttonSx(theme, { ...rest, ...appearance, busy }, rest.sx);
}
