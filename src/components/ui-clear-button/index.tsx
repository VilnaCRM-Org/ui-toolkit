import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import clearButtonWarning from './clear-button-warnings';
import { ClearGlyph } from './clear-glyph';
import { clearButtonGlyphSx, clearButtonLabelSx, clearButtonSx, GLYPH_CLASS } from './styles';
import type { UiClearButtonProps } from './types';

/** Default visible label, Ukrainian like every other built-in string in the toolkit. */
export const DEFAULT_LABEL: string = 'Очистити фільтри';

// The view model the button renders from: the wired/static split and the
// `aria-disabled` boundary both live here, ahead of any DOM concern.
export interface ClearButtonModel {
  interactive: boolean;
  ariaDisabled: true | undefined;
  label: string;
  onActivate: () => void;
}

// Activation is gated before any DOM concern: a disabled button swallows it so
// `onActivate` never fires, which is what lets the button stay focusable.
function makeActivate(disabled: boolean, onActivate?: () => void): () => void {
  return (): void => {
    if (disabled) return;
    onActivate?.();
  };
}

export function useClearButtonModel(props: Readonly<UiClearButtonProps>): ClearButtonModel {
  useDevWarning(clearButtonWarning(props));
  const disabled: boolean = props.disabled ?? false;
  const interactive: boolean = props.onActivate != null;
  return {
    interactive,
    ariaDisabled: interactive && disabled ? true : undefined,
    label: props.label ?? DEFAULT_LABEL,
    onActivate: makeActivate(disabled, props.onActivate),
  };
}

// The visible content shared by the wired (button) and static shells — one DOM
// tree, identical reading order, so it never changes between the two branches.
function ClearButtonContent({ label }: Readonly<{ label: string }>): React.ReactElement {
  return (
    <>
      <Box component="span" className={GLYPH_CLASS} sx={clearButtonGlyphSx}>
        <ClearGlyph />
      </Box>
      <Box component="span" sx={clearButtonLabelSx}>
        {label}
      </Box>
    </>
  );
}

interface ClearButtonShellProps {
  button: UiClearButtonProps;
  model: ClearButtonModel;
  buttonRef: React.ForwardedRef<HTMLButtonElement>;
  sx: SxProps<Theme>;
}

// The wired button is ONE native `<button type="button">` spanning the whole
// row — the `type` is mandatory so it never submits an enclosing form. It
// carries no ARIA state beyond the `aria-disabled` boundary and no key handlers:
// the native button already fires on Enter and Space.
function WiredClearButton({
  button,
  model,
  buttonRef,
  sx,
}: Readonly<ClearButtonShellProps>): React.ReactElement {
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
      <ClearButtonContent label={model.label} />
    </Box>
  );
}

// The unwired button: static, non-interactive content — no role, no tabindex and
// no ARIA of any kind, not even `aria-disabled`. The content tree is identical
// to the wired branch, glyph included, decoratively.
function StaticClearButton({
  button,
  model,
  sx,
}: Readonly<ClearButtonShellProps>): React.ReactElement {
  return (
    <Box component="span" id={button.id} lang={button.lang} sx={sx}>
      <ClearButtonContent label={model.label} />
    </Box>
  );
}

// A bare-ink clear action (Figma Board A, rest `451:25793`): a leading × glyph
// beside a label, with no fill, border, radius, shadow or padding in any state —
// only the label/glyph ink changes. Passing `onActivate` turns the row into a
// single native button; without it the row is static content. The forwarded ref
// lands on that button so a consumer can re-resolve focus. See `types.ts` for
// the full prop contract.
const UiClearButton: React.ForwardRefExoticComponent<
  UiClearButtonProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiClearButtonProps>(
  (props: Readonly<UiClearButtonProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: ClearButtonModel = useClearButtonModel(props);
    const sx: SxProps<Theme> = clearButtonSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredClearButton button={props} model={model} buttonRef={ref} sx={sx} />;
    }
    return <StaticClearButton button={props} model={model} buttonRef={null} sx={sx} />;
  }
);

UiClearButton.displayName = 'UiClearButton';

export default UiClearButton;
