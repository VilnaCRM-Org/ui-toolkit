import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import type { UiButtonProps } from './types';
import useButtonLoading, { type ButtonLoading } from './use-button-loading';
import useButtonSx, { splitLook } from './use-button-sx';

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

function UiButton({
  to,
  href,
  component,
  type = 'button',
  loading,
  loadingText,
  loadingMode,
  loadingIndicator,
  onClick,
  children,
  ...props
}: React.PropsWithChildren<UiButtonProps>): React.ReactElement {
  const [look, rest] = splitLook(props);
  const busy: ButtonLoading = useButtonLoading(
    { loading, loadingText, loadingMode, loadingIndicator, onClick },
    rest
  );
  const sx: SxProps<Theme> = useButtonSx(rest, busy.busy, { ...look, native: busy.native });

  return (
    <>
      <Button
        {...resolveButtonProps({ to, href, component, type })}
        {...rest}
        {...busy.buttonProps}
        sx={sx}
      >
        {children}
        {busy.spinner}
      </Button>
      {busy.status}
    </>
  );
}

export default UiButton;
