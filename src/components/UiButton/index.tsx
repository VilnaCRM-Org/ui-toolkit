import { Button, ThemeProvider } from '@mui/material';
import React from 'react';

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

function UiButton({
  to,
  href,
  component,
  type = 'button',
  children,
  ...rest
}: React.PropsWithChildren<UiButtonProps>): React.ReactElement {
  const isCustomComponent: boolean = component !== undefined && typeof component !== 'string';
  const linkTarget: string | undefined = resolveLinkTarget(to) ?? href;
  const resolvedComponent: React.ElementType | undefined =
    component ?? (linkTarget ? 'a' : undefined);
  const isButtonElement: boolean = !resolvedComponent || resolvedComponent === 'button';
  // Custom link components (e.g. a router Link) navigate via `to`, not a flattened
  // `href`; forwarding the raw target keeps them operable. Built-in `a`/`button`
  // elements have no `to` prop, so they fall back to the synthesized href.
  const componentProps: { component?: React.ElementType; to?: UiButtonProps['to'] } =
    resolvedComponent ? { component: resolvedComponent } : {};
  if (isCustomComponent && to !== undefined) {
    componentProps.to = to;
  }
  const hrefProps: { href?: string } =
    linkTarget && !isButtonElement && !isCustomComponent ? { href: linkTarget } : {};
  const typeProps: { type?: UiButtonProps['type'] } = isButtonElement ? { type } : {};

  return (
    <ThemeProvider theme={theme}>
      <Button {...componentProps} {...hrefProps} {...typeProps} {...rest}>
        {children}
      </Button>
    </ThemeProvider>
  );
}

export default UiButton;
