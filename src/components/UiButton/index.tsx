import { Button, ThemeProvider } from '@mui/material';
import React from 'react';

import { theme } from './theme';
import { UiButtonProps } from './types';

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
  const linkTarget: string | undefined = resolveLinkTarget(to) ?? href;
  const resolvedComponent: React.ElementType | undefined =
    component ?? (linkTarget ? 'a' : undefined);
  const isButtonElement: boolean = !resolvedComponent || resolvedComponent === 'button';
  const componentProps: { component?: React.ElementType } = resolvedComponent
    ? { component: resolvedComponent }
    : {};
  const hrefProps: { href?: string } = linkTarget && !isButtonElement ? { href: linkTarget } : {};
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
