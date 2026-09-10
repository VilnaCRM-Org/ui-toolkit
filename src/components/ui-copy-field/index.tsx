import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { CopyFieldContent } from './copy-field-content';
import { copyFieldSx } from './styles';
import type { UiCopyFieldProps } from './types';
import { useCopyField, type CopyFieldModel } from './use-copy-field';

interface CopyFieldButtonProps {
  field: UiCopyFieldProps;
  model: CopyFieldModel;
  fieldRef: React.ForwardedRef<HTMLButtonElement>;
  sx: SxProps<Theme>;
}

// The whole chip is ONE native `<button type="button">` spanning the full
// 226x36 pill (the `type` is mandatory — an untyped button submits an
// enclosing form). Copying is its only action, so it carries NO ARIA state
// beyond the disabled boundary: no `aria-pressed` (the chip is not a toggle),
// no `aria-expanded`, and no live region. The post-copy confirmation is
// therefore a PURELY VISUAL latch, reflected onto the root as `data-copied`
// so the recipe can hold the chip's own active paint — it deliberately does
// not touch the accessible name, which stays the visible code plus
// `copyLabel`. A disabled chip keeps the aria-disabled boundary — still a
// real, focusable button whose activation no-ops — so keyboard focus is never
// dropped when a focused chip flips disabled.
function CopyFieldButton({
  field,
  model,
  fieldRef,
  sx,
}: Readonly<CopyFieldButtonProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={field.id}
      lang={field.lang}
      aria-disabled={model.ariaDisabled}
      data-copied={model.copied ? 'true' : undefined}
      onClick={model.onActivate}
      ref={fieldRef}
      sx={sx}
    >
      <CopyFieldContent value={field.value} copyLabel={model.copyLabel} />
    </Box>
  );
}

// One copy-to-clipboard chip (Figma Board A, node 451:25827): a code string
// beside a decorative `copy-02` glyph. The forwarded ref lands on the button
// so a consumer can re-resolve focus. See `types.ts` for the full prop
// contract.
const UiCopyField: React.ForwardRefExoticComponent<
  UiCopyFieldProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiCopyFieldProps>(
  (props: Readonly<UiCopyFieldProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: CopyFieldModel = useCopyField(props);
    const sx: SxProps<Theme> = copyFieldSx(props.sx);
    return <CopyFieldButton field={props} model={model} fieldRef={ref} sx={sx} />;
  }
);

UiCopyField.displayName = 'UiCopyField';

export default UiCopyField;
