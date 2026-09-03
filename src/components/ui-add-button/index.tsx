import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { AddButtonContent } from './add-button-content';
import { addButtonSx } from './styles';
import type { UiAddButtonProps } from './types';
import { useAddButton, type AddButtonModel } from './use-add-button';

interface AddButtonShellProps {
  button: UiAddButtonProps;
  model: AddButtonModel;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
  sx: SxProps<Theme>;
}

// The wired button is ONE native `<button type="button">` spanning the whole
// pill (the `type` is mandatory — an untyped button submits an enclosing
// form). Adding is its only action, so it carries NO ARIA state at all: no
// `aria-pressed`, no `aria-expanded`. There are no key handlers either — the
// native button already fires on Enter and Space. A disabled button keeps the
// `aria-disabled` boundary — still a real, focusable button whose activation
// no-ops — so keyboard focus is never dropped when a focused button flips
// disabled.
function WiredAddButton({
  button,
  model,
  buttonRef,
  sx,
}: Readonly<AddButtonShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={button.id}
      lang={button.lang}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={buttonRef}
      sx={sx}
    >
      <AddButtonContent label={model.label} />
    </Box>
  );
}

// The unwired button: static, non-interactive content — no role, no
// tabindex, and no ARIA of any kind, not even `aria-disabled`. The content
// tree is identical to the wired branch, and a truthy `disabled` is
// deliberately NOT painted here — the static branch never renders state it
// cannot expose programmatically.
function StaticAddButton({ button, model, sx }: Readonly<AddButtonShellProps>): React.ReactElement {
  return (
    <Box component="span" id={button.id} lang={button.lang} sx={sx}>
      <AddButtonContent label={model.label} />
    </Box>
  );
}

// The board "add column/row" control (Figma "plus" chip button). Passing
// `onActivate` turns the pill into a single native button; without it the
// button is static content. The forwarded ref lands on that button so a
// consumer can re-resolve focus. See `types.ts` for the full prop contract.
const UiAddButton: React.ForwardRefExoticComponent<
  UiAddButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiAddButtonProps>(
  (props: Readonly<UiAddButtonProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: AddButtonModel = useAddButton(props);
    const sx: SxProps<Theme> = addButtonSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredAddButton button={props} model={model} buttonRef={ref} sx={sx} />;
    }
    return <StaticAddButton button={props} model={model} buttonRef={ref} sx={sx} />;
  }
);

UiAddButton.displayName = 'UiAddButton';

export default UiAddButton;
