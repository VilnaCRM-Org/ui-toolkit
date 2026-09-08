import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import chevronButtonWarning from './chevron-button-warnings';
import { ChevronGlyph } from './chevron-glyph';
import { chevronButtonSx } from './styles';
import type { UiChevronButtonProps } from './types';

interface ChevronShellProps {
  button: UiChevronButtonProps;
  sx: SxProps<Theme>;
}

interface WiredChevronShellProps extends ChevronShellProps {
  ariaDisabled: true | undefined;
  onActivate: () => void;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
}

// The wired button is ONE native `<button type="button">` (`type` is mandatory
// — an untyped button submits an enclosing form) named entirely by
// `aria-label`, because an icon-only control has no visible text for the name
// to contain. No key handlers: a native button already fires on Enter and
// Space, and a manual handler would double-fire on Space. A disabled button
// keeps the `aria-disabled` boundary — still a real, focusable button whose
// activation no-ops — so keyboard focus is never dropped when a focused button
// flips disabled.
function WiredChevronButton({
  button,
  ariaDisabled,
  onActivate,
  buttonRef,
  sx,
}: Readonly<WiredChevronShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={button.id}
      aria-label={button.label}
      aria-disabled={ariaDisabled}
      onClick={onActivate}
      ref={buttonRef}
      sx={sx}
    >
      <ChevronGlyph direction={button.direction ?? 'right'} />
    </Box>
  );
}

// The unwired button: static, non-interactive paint — no role, no tabindex, no
// name and no ARIA of any kind, not even `aria-disabled` (the `UiActionIconBar`
// unwired rule). The content tree is identical to the wired branch.
function StaticChevronButton({ button, sx }: Readonly<ChevronShellProps>): React.ReactElement {
  return (
    <Box component="span" id={button.id} sx={sx}>
      <ChevronGlyph direction={button.direction ?? 'right'} />
    </Box>
  );
}

// Activation is gated here, before any DOM concern: a disabled button swallows
// it so `onActivate` never fires (the `aria-disabled` boundary), which is what
// lets the button stay real and focusable. Only ever called with a real
// callback — `onActivate` is never optional here — because it is invoked from
// the branch below where `props.onActivate != null` has already narrowed it.
function makeActivate(disabled: boolean, onActivate: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onActivate();
  };
}

/**
 * A 30px circular chevron button (Figma nodes 451:25765/25768/25771/25774,
 * Board A y=1622). See `types.ts` for the full prop contract — icon-only
 * `label`, the `UiActionIconBar` wired/static split, the `aria-disabled`
 * boundary and the visual-only `direction`.
 */
const UiChevronButton: React.ForwardRefExoticComponent<
  UiChevronButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiChevronButtonProps>(
  (props: Readonly<UiChevronButtonProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    useDevWarning(chevronButtonWarning(props));
    const disabled: boolean = props.disabled ?? false;
    const sx: SxProps<Theme> = chevronButtonSx({
      interactive: props.onActivate != null,
      sx: props.sx,
    });
    if (props.onActivate != null) {
      return (
        <WiredChevronButton
          button={props}
          ariaDisabled={disabled ? true : undefined}
          onActivate={makeActivate(disabled, props.onActivate)}
          buttonRef={ref}
          sx={sx}
        />
      );
    }
    return <StaticChevronButton button={props} sx={sx} />;
  }
);

UiChevronButton.displayName = 'UiChevronButton';

export default UiChevronButton;
