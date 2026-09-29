import { Box, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { useUiTheme } from '@/utils/ui-theme';

import { srOnlySx } from '../field-controls';

import { ButtonSpinner, useBusyClick, useButtonBusy, type ButtonBusyState } from './loading';
import { buttonSx } from './styles';
import type { UiButtonProps } from './types';
import type { ButtonSxState, ButtonVariantProps } from './variant-styles';

function resolveLinkTarget(to?: UiButtonProps['to']): string | undefined {
  if (!to) {
    return undefined;
  }

  if (typeof to === 'string') {
    return to;
  }

  return `${to.pathname ?? ''}${to.search ?? ''}${to.hash ?? ''}` || undefined;
}

type ButtonElementProps = {
  component?: React.ElementType;
  to?: UiButtonProps['to'];
  href?: string;
  type?: UiButtonProps['type'];
};

function buildComponentProps(
  resolvedComponent: React.ElementType | undefined,
  isCustomComponent: boolean,
  to: UiButtonProps['to'] | undefined
): { component?: React.ElementType; to?: UiButtonProps['to'] } {
  const componentProps: { component?: React.ElementType; to?: UiButtonProps['to'] } =
    resolvedComponent ? { component: resolvedComponent } : {};
  if (isCustomComponent && to !== undefined) {
    componentProps.to = to;
  }
  return componentProps;
}

function buildHrefProps(
  linkTarget: string | undefined,
  isButtonElement: boolean,
  isCustomComponent: boolean
): { href?: string } {
  return linkTarget && !isButtonElement && !isCustomComponent ? { href: linkTarget } : {};
}

function resolveButtonProps({
  to,
  href,
  component,
  type,
}: Pick<UiButtonProps, 'to' | 'href' | 'component' | 'type'>): ButtonElementProps {
  const isCustomComponent: boolean = component !== undefined && typeof component !== 'string';
  const linkTarget: string | undefined = resolveLinkTarget(to) ?? href;
  const resolvedComponent: React.ElementType | undefined =
    component ?? (linkTarget ? 'a' : undefined);
  const isButtonElement: boolean = !resolvedComponent || resolvedComponent === 'button';

  return {
    ...buildComponentProps(resolvedComponent, isCustomComponent, to),
    ...buildHrefProps(linkTarget, isButtonElement, isCustomComponent),
    ...(isButtonElement ? { type } : {}),
  };
}

type BusyAttributes = { disabled?: boolean | undefined; 'aria-disabled'?: boolean | undefined };

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

function useButtonSx(
  rest: ButtonVariantProps & { sx?: SxProps<Theme> | undefined },
  busy: boolean,
  appearance: Pick<ButtonSxState, 'native' | 'focusOutline'>
): SxProps<Theme> {
  const theme: Theme = useUiTheme();
  return buttonSx(theme, { ...rest, ...appearance, busy }, rest.sx);
}

function LoadingStatus({ announced }: Readonly<{ announced: string }>): React.ReactElement {
  return (
    <Box role="status" aria-atomic="true" sx={srOnlySx}>
      {announced}
    </Box>
  );
}

function UiButton({
  to,
  href,
  component,
  type = 'button',
  loading,
  loadingText,
  loadingMode,
  loadingIndicator,
  focusOutline,
  onClick,
  children,
  ...rest
}: React.PropsWithChildren<UiButtonProps>): React.ReactElement {
  const elementProps: ButtonElementProps = resolveButtonProps({ to, href, component, type });
  const native: boolean = loadingMode === 'native';
  const state: ButtonBusyState = useButtonBusy(loading, loadingText);
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = useBusyClick(state.busy, onClick);
  const sx: SxProps<Theme> = useButtonSx(rest, state.busy, { native, focusOutline });

  return (
    <>
      <Button
        {...elementProps}
        {...rest}
        {...busyAttributes(state.busy, native, rest)}
        onClick={handleClick}
        sx={sx}
      >
        {children}
        {state.busy ? <ButtonSpinner indicator={native ? loadingIndicator : undefined} /> : null}
      </Button>
      {loading === undefined || native ? null : <LoadingStatus announced={state.announced} />}
    </>
  );
}

export default UiButton;
