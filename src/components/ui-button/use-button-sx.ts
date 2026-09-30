import type { SxProps, Theme } from '@mui/material';

import { useUiTheme } from '@/utils/ui-theme';

import { buttonSx } from './styles';
import type { UiButtonProps } from './types';
import type { ButtonSxState, ButtonVariantProps } from './variant-styles';

type LookKey = 'focusOutline' | 'appearance' | 'kitInk' | 'responsiveLabel';

export type ButtonLook = Pick<ButtonSxState, LookKey | 'native'>;

export function splitLook<P extends Pick<UiButtonProps, LookKey>>({
  focusOutline,
  appearance,
  kitInk,
  responsiveLabel,
  ...rest
}: P): [Omit<ButtonLook, 'native'>, Omit<P, LookKey>] {
  return [{ focusOutline, appearance, kitInk, responsiveLabel }, rest];
}

export default function useButtonSx(
  rest: ButtonVariantProps & { sx?: SxProps<Theme> | undefined },
  busy: boolean,
  look: ButtonLook
): SxProps<Theme> {
  const theme: Theme = useUiTheme();
  return buttonSx(theme, { ...rest, ...look, busy }, rest.sx);
}
