import { Box } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import {
  ButtonSpinner,
  nativeLoadingProps,
  useBusyClick,
  useButtonBusy,
  type ButtonBusyState,
} from './loading';
import type { UiButtonProps } from './types';

type LoadingInput = Pick<
  UiButtonProps,
  'loading' | 'loadingText' | 'loadingMode' | 'loadingIndicator' | 'onClick'
>;

type BusyAttributes = { disabled?: boolean | undefined; 'aria-disabled'?: boolean | undefined };

type LoadingButtonProps = BusyAttributes &
  ReturnType<typeof nativeLoadingProps> & {
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  };

export type ButtonLoading = {
  busy: boolean;
  native: boolean;
  buttonProps: LoadingButtonProps;
  spinner: React.ReactNode;
  status: React.ReactNode;
};

function busyAttributes(
  busy: boolean,
  native: boolean,
  { disabled, 'aria-disabled': ariaDisabled }: Pick<UiButtonProps, 'disabled' | 'aria-disabled'>
): BusyAttributes {
  if (native) {
    return { disabled: disabled === true || busy };
  }
  return { 'aria-disabled': busy ? true : (ariaDisabled as boolean | undefined) };
}

function LoadingStatus({ announced }: Readonly<{ announced: string }>): React.ReactElement {
  return (
    <Box role="status" aria-atomic="true" sx={srOnlySx}>
      {announced}
    </Box>
  );
}

export default function useButtonLoading(
  input: LoadingInput,
  rest: Pick<UiButtonProps, 'disabled' | 'aria-disabled'>
): ButtonLoading {
  const native: boolean = input.loadingMode === 'native';
  const state: ButtonBusyState = useButtonBusy(input.loading, input.loadingText, native);
  const onClick: React.MouseEventHandler<HTMLButtonElement> = useBusyClick(
    state.busy,
    input.onClick
  );
  const silent: boolean = input.loading === undefined || native;
  return {
    busy: state.busy,
    native,
    buttonProps: {
      ...busyAttributes(state.busy, native, rest),
      ...nativeLoadingProps(native, state.busy, input.loadingIndicator),
      onClick,
    },
    spinner: state.busy && !native ? <ButtonSpinner /> : null,
    status: silent ? null : <LoadingStatus announced={state.announced} />,
  };
}
