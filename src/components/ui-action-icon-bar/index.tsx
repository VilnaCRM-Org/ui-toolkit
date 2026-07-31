import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { ActionIconBarContent } from './action-icon-bar-content';
import { actionIconBarSx } from './styles';
import type { UiActionIconBarProps } from './types';
import { useActionIconBar, type ActionIconBarModel } from './use-action-icon-bar';

interface BarShellProps {
  bar: UiActionIconBarProps;
  model: ActionIconBarModel;
  sx: SxProps<Theme>;
  barRef: React.ForwardedRef<HTMLDivElement>;
}

// The wired bar is a `role="group"` container named by `aria-label` — and it is
// deliberately NOT `role="toolbar"`. A toolbar contractually promises APG
// arrow-key roving-tabindex navigation, so shipping the role without a complete
// roving implementation would be worse than shipping no role at all; every
// action is therefore an ordinary, independent tab stop in DOM order. Do not
// upgrade this to a toolbar without landing the full roving implementation in
// the same change. The group itself carries no state, no tabindex and no
// keyboard handling: it is purely the name and the boundary for its buttons.
function WiredBar({ bar, model, sx, barRef }: Readonly<BarShellProps>): React.ReactElement {
  return (
    <Box component="div" role="group" id={bar.id} aria-label={bar.label} ref={barRef} sx={sx}>
      <ActionIconBarContent actions={model.actions} barDisabled={model.disabled} />
    </Box>
  );
}

// The unwired bar: a plain `<div>` with no group role, no name and no ARIA of
// any kind (S2) — a group of nothing is noise in the accessibility tree. Its
// actions are static `<span>`s, and the content tree is identical to the wired
// branch so the reading order never changes.
function StaticBar({ bar, model, sx, barRef }: Readonly<BarShellProps>): React.ReactElement {
  return (
    <Box component="div" id={bar.id} ref={barRef} sx={sx}>
      <ActionIconBarContent actions={model.actions} barDisabled={model.disabled} />
    </Box>
  );
}

// A row of icon-only actions (Figma Board A, y = 1412-1422): up to six 24px
// stroke-only glyphs on a 12px rhythm. Passing a callback on an action turns it
// into a native `<button type="button">`; a bar with at least one wired action
// becomes a named `role="group"`. The bar owns no menu, no focus management and
// no state of its own — it fires callbacks and paints what the consumer feeds
// back. The forwarded ref lands on the root element. See `types.ts` for the full
// prop and accessibility contract.
const UiActionIconBar: React.ForwardRefExoticComponent<
  UiActionIconBarProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<HTMLDivElement, UiActionIconBarProps>(
  (props: Readonly<UiActionIconBarProps>, ref: React.ForwardedRef<HTMLDivElement>) => {
    const model: ActionIconBarModel = useActionIconBar(props);
    const sx: SxProps<Theme> = actionIconBarSx({ sx: props.sx });
    if (model.interactive) {
      return <WiredBar bar={props} model={model} sx={sx} barRef={ref} />;
    }
    return <StaticBar bar={props} model={model} sx={sx} barRef={ref} />;
  }
);

UiActionIconBar.displayName = 'UiActionIconBar';

export default UiActionIconBar;
