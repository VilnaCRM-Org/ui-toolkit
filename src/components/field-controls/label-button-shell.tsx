import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

export interface LabelButtonShellProps {
  id: string | undefined;
  lang: string | undefined;
  /** `true` only on the aria-disabled boundary; never the native attribute. */
  ariaDisabled: true | undefined;
  onActivate: () => void;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
  sx: SxProps<Theme>;
  children: React.ReactNode;
}

/**
 * The wired shell shared by the plain label buttons — one native
 * `<button type="button">` spanning the whole control. The `type` is mandatory:
 * an untyped button submits an enclosing form. There are no key handlers,
 * because a native button already fires on Enter and Space, and a disabled one
 * keeps the `aria-disabled` boundary so keyboard focus is never dropped when a
 * focused button flips disabled.
 *
 * Props are applied explicitly rather than spread, so the rendered wiring is
 * identical to writing the `<Box>` inline.
 */
export function LabelButtonShell(props: Readonly<LabelButtonShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={props.id}
      lang={props.lang}
      aria-disabled={props.ariaDisabled}
      onClick={props.onActivate}
      ref={props.buttonRef}
      sx={props.sx}
    >
      {props.children}
    </Box>
  );
}

export interface LabelStaticShellProps {
  id: string | undefined;
  lang: string | undefined;
  sx: SxProps<Theme>;
  children: React.ReactNode;
}

/**
 * The unwired counterpart: static, non-interactive content with no role, no
 * tabindex and no ARIA of any kind, not even `aria-disabled`. The content tree
 * is identical to the wired branch, and a truthy `disabled` is deliberately not
 * painted here — the static branch never renders state it cannot expose
 * programmatically.
 */
export function LabelStaticShell(props: Readonly<LabelStaticShellProps>): React.ReactElement {
  return (
    <Box component="span" id={props.id} lang={props.lang} sx={props.sx}>
      {props.children}
    </Box>
  );
}
