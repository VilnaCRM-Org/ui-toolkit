import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { FilterChipContent } from './filter-chip-content';
import { filterChipSx } from './styles';
import type { UiFilterChipProps } from './types';
import { useFilterChip, type FilterChipModel } from './use-filter-chip';

interface ChipShellProps {
  chip: UiFilterChipProps;
  model: FilterChipModel;
  chipRef: React.ForwardedRef<HTMLButtonElement>;
  sx: SxProps<Theme>;
}

// The wired chip is ONE native `<button type="button">` spanning the whole 30px
// pill (the `type` is mandatory — an untyped button submits the enclosing filter
// form). Removal is its only action, so it carries NO ARIA state at all: no
// `aria-pressed`, no `aria-checked`, no `aria-expanded`. There are no key
// handlers either — the native button already fires on Enter and Space, and a
// manual handler would double-fire on Space. A disabled chip keeps the
// aria-disabled boundary — still a real, focusable button whose activation no-ops
// in the model — so keyboard focus is never dropped when a focused chip flips
// disabled. No inner interactive elements and no list semantics: the consumer
// owns any surrounding list structure.
function WiredChip({ chip, model, chipRef, sx }: Readonly<ChipShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={chip.id}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      ref={chipRef}
      sx={sx}
    >
      <FilterChipContent
        label={chip.label}
        filterValue={chip.filterValue}
        lang={chip.lang}
        removeLabel={model.removeLabel}
      />
    </Box>
  );
}

// The unwired chip: static, non-interactive content — no role, no tabindex, and
// no ARIA of any kind, not even `aria-disabled`. The visible tree is identical to
// the wired branch (the × glyph included, decoratively) but the hidden removal
// suffix is dropped — a static chip cannot remove anything, so announcing the
// action would be a promise it cannot keep. A truthy `disabled`
// is deliberately NOT painted here: the static branch never renders state it
// cannot expose programmatically, which is why the styles key the disabled chrome
// off `[aria-disabled="true"]` — an attribute this branch never has.
function StaticChip({ chip, sx }: Readonly<ChipShellProps>): React.ReactElement {
  return (
    <Box component="div" id={chip.id} sx={sx}>
      <FilterChipContent
        label={chip.label}
        filterValue={chip.filterValue}
        lang={chip.lang}
        removeLabel={null}
      />
    </Box>
  );
}

// One removable filter chip (Figma "Tags" master, node 397:19014): a two-segment
// label beside a decorative × glyph. Passing `onRemove` turns the entire pill into
// a single remove button — never a smaller nested ×, which would shrink the target
// and give one action two tab stops; without it the chip is static content. The
// forwarded ref lands on that button so a consumer can re-resolve focus. The chip
// NEVER moves focus itself: after handling `onRemove` the consumer must move focus
// to a sibling chip or the filter-region heading, or it drops to `<body>`
// (SC 2.4.3). See `types.ts` for the full prop contract.
const UiFilterChip: React.ForwardRefExoticComponent<
  UiFilterChipProps & React.RefAttributes<HTMLButtonElement>
> = React.forwardRef<HTMLButtonElement, UiFilterChipProps>(
  (props: Readonly<UiFilterChipProps>, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const model: FilterChipModel = useFilterChip(props);
    const sx: SxProps<Theme> = filterChipSx({ interactive: model.interactive, sx: props.sx });
    if (model.interactive) {
      return <WiredChip chip={props} model={model} chipRef={ref} sx={sx} />;
    }
    return <StaticChip chip={props} model={model} chipRef={ref} sx={sx} />;
  }
);

UiFilterChip.displayName = 'UiFilterChip';

export default UiFilterChip;
