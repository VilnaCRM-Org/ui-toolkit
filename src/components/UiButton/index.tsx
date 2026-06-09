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
  const linkTarget = resolveLinkTarget(to) ?? href;
  const resolvedComponent = component ?? (linkTarget ? 'a' : undefined);
  const isButtonElement = !resolvedComponent || resolvedComponent === 'button';
  const componentProps = resolvedComponent ? { component: resolvedComponent } : {};
  const hrefProps = linkTarget && !isButtonElement ? { href: linkTarget } : {};
  const typeProps = isButtonElement ? { type } : {};

  return (
    <ThemeProvider theme={theme}>
      <Button {...componentProps} {...hrefProps} {...typeProps} {...rest}>
        {children}
      </Button>
    </ThemeProvider>
  );
}

export default UiButton;
