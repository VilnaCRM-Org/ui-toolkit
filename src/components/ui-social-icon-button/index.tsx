import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { SocialGlyph } from './social-glyph';
import { socialIconButtonSx } from './styles';
import type { UiSocialIconButtonProps } from './types';
import { useSocialIconButton, type SocialIconButtonModel } from './use-social-icon-button';

interface ChipShellProps {
  chip: UiSocialIconButtonProps;
  model: SocialIconButtonModel;
  sx: SxProps<Theme>;
}

type AnchorRef = React.ForwardedRef<HTMLAnchorElement>;
type ButtonRef = React.ForwardedRef<HTMLButtonElement>;

// A disabled anchor keeps its href (dropping it would strip the `link` role
// and the accessible name), so activation is cancelled explicitly — the
// `UiLink` precedent, verbatim.
function suppressNavigation(event: React.MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

// Anchor branch (`href` present). `onActivate` is never wired here: when both
// props are supplied the anchor wins (see `social-icon-button-warnings.ts`).
function AnchorChip({
  chip,
  model,
  sx,
  chipRef,
}: Readonly<ChipShellProps & { chipRef: AnchorRef }>): React.ReactElement {
  return (
    <Box
      component="a"
      href={chip.href}
      id={chip.id}
      aria-label={model.ariaLabel}
      aria-disabled={model.ariaDisabled}
      tabIndex={model.ariaDisabled ? -1 : undefined}
      onClick={model.ariaDisabled ? suppressNavigation : undefined}
      ref={chipRef}
      sx={sx}
    >
      <SocialGlyph network={chip.network} />
    </Box>
  );
}

// Button branch (`href` absent): the repo `aria-disabled` + swallowed-
// activation boundary — still a real, focusable button; native `disabled` is
// never set.
function ButtonChip({
  chip,
  model,
  sx,
  chipRef,
}: Readonly<ChipShellProps & { chipRef: ButtonRef }>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={chip.id}
      aria-label={model.ariaLabel}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={chipRef}
      sx={sx}
    >
      <SocialGlyph network={chip.network} />
    </Box>
  );
}

// One 40x40 round social chip (Figma Board A). Icon-only, so the name comes
// from `aria-label` — see `types.ts` for the full prop contract, and
// `use-social-icon-button.ts` for the element-choice / disabled-boundary
// model this renders from.
const UiSocialIconButton: React.ForwardRefExoticComponent<
  UiSocialIconButtonProps & React.RefAttributes<HTMLAnchorElement | HTMLButtonElement>
> = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, UiSocialIconButtonProps>(
  (
    props: Readonly<UiSocialIconButtonProps>,
    ref: React.ForwardedRef<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    const model: SocialIconButtonModel = useSocialIconButton(props);
    const sx: SxProps<Theme> = socialIconButtonSx({ sx: props.sx });
    if (model.isAnchor) {
      return <AnchorChip chip={props} model={model} sx={sx} chipRef={ref as AnchorRef} />;
    }
    return <ButtonChip chip={props} model={model} sx={sx} chipRef={ref as ButtonRef} />;
  }
);

UiSocialIconButton.displayName = 'UiSocialIconButton';

export default UiSocialIconButton;
