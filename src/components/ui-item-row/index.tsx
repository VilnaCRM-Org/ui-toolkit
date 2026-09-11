import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { rowContainerSx } from './container-sx';
import { resolveRecipe } from './recipe';
import { RowContent } from './row-content';
import type { UiItemRowProps } from './types';
import { useItemRow, type ItemRowModel } from './use-item-row';

interface WiredRowProps {
  row: UiItemRowProps;
  model: ItemRowModel;
  sx: SxProps<Theme>;
}

// The wired row IS the disclosure: one native `<button type="button">` carrying
// `aria-expanded` (and `aria-controls` only while expanded). A muted row keeps the
// aria-disabled boundary pattern — still a real, focusable button, activation
// no-ops in the model — so keyboard focus is never dropped on a state change.
function WiredRow({ row, model, sx }: Readonly<WiredRowProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      aria-expanded={model.ariaExpanded}
      aria-controls={model.ariaControls}
      aria-disabled={model.ariaDisabled}
      onClick={model.onActivate}
      sx={sx}
    >
      <RowContent method={row.method} path={row.path} description={row.description} />
    </Box>
  );
}

interface StaticRowProps {
  row: UiItemRowProps;
  sx: SxProps<Theme>;
}

// The unwired row: static, non-interactive content — no button role, no tabindex,
// no aria-expanded. The chevron still renders, purely decoratively.
function StaticRow({ row, sx }: Readonly<StaticRowProps>): React.ReactElement {
  return (
    <Box component="div" sx={sx}>
      <RowContent method={row.method} path={row.path} description={row.description} />
    </Box>
  );
}

// One REST-API endpoint row (Figma "atom switcher"): a method badge, endpoint
// path, description, a chevron expand affordance and a decorative open-padlock.
// Passing `onToggle` turns the whole row into an always-controlled APG disclosure
// button; without it the row is static content. Desktop and mobile share one DOM
// tree (CSS-only layout switch). See `types.ts`/the a11y contract for the full
// disclosure and muted-status semantics.
function UiItemRow(props: Readonly<UiItemRowProps>): React.ReactElement {
  const model: ItemRowModel = useItemRow(props);
  const recipe = resolveRecipe(props.method, model.muted);
  const sx: SxProps<Theme> = rowContainerSx({
    recipe,
    interactive: model.interactive,
    expanded: model.expanded,
    sx: props.sx,
  });
  if (model.interactive) {
    return <WiredRow row={props} model={model} sx={sx} />;
  }
  return <StaticRow row={props} sx={sx} />;
}

UiItemRow.displayName = 'UiItemRow';

export default UiItemRow;
