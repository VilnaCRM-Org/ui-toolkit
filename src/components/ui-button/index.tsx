import { Box, Button, ThemeProvider } from '@mui/material';
import React from 'react';

import { srOnlySx } from '../field-controls';

import { busySx, ButtonSpinner, useButtonBusy, type ButtonBusyState } from './loading';
import { theme } from './theme';
import type { UiButtonProps } from './types';

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

// Custom link components (e.g. a router Link) navigate via `to`, not a flattened
// `href`; forwarding the raw target keeps them operable. Built-in `a`/`button`
// elements have no `to` prop, so they fall back to the synthesized href.
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

function UiButton({
  to,
  href,
  component,
  type = 'button',
  loading,
  loadingText,
  onClick,
  children,
  ...rest
}: React.PropsWithChildren<UiButtonProps>): React.ReactElement {
  const elementProps: ButtonElementProps = resolveButtonProps({ to, href, component, type });
  const state: ButtonBusyState = useButtonBusy(loading, loadingText);

  return (
    <ThemeProvider theme={theme}>
      {/* Explicit props are written AFTER the spread so they win. `loading` is
          deliberately destructured out and never reaches MUI — see types.ts. */}
      <Button
        {...elementProps}
        {...rest}
        aria-disabled={state.busy ? true : rest['aria-disabled']}
        onClick={state.busy ? undefined : onClick}
        sx={busySx(state.busy, rest.sx)}
      >
        {children}
        {state.busy ? <ButtonSpinner /> : null}
      </Button>
      <Box role="status" aria-atomic="true" sx={srOnlySx}>
        {state.announced}
      </Box>
    </ThemeProvider>
  );
}

export default UiButton;
