import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import React from 'react';

import { ActionGlyph } from './action-glyph';
import {
  BACKDROP_CLASS,
  actionBackdropSx,
  actionButtonSx,
  glyphLayerSx,
  hasBackdrop,
} from './styles';
import type { UiActionIconBarAction } from './types';
import { useActionState, type ActionState } from './use-action-state';

interface ActionShellProps {
  action: UiActionIconBarAction;
  state: ActionState;
  sx: SxProps<Theme>;
}

interface ActionSlotContentProps {
  action: UiActionIconBarAction;
  pressed: boolean;
}

// The visible content shared by the wired (button) and static shells — ONE DOM
// tree, identical reading order. Both layers are PAINT and never controls: the
// glyph is `aria-hidden` inside the shared `Glyph` wrapper, and the danger
// backdrop is an `aria-hidden` span that only the trash lane renders, because
// only the trash lane has a Figma-authored pressed plate (Frame 5441). It is
// painted from the root's `:active` rule, so the static branch — which has no
// pointer chrome at all — leaves it transparent.
function ActionSlotContent({
  action,
  pressed,
}: Readonly<ActionSlotContentProps>): React.ReactElement {
  return (
    <>
      {hasBackdrop(action.icon) ? (
        <Box component="span" aria-hidden="true" className={BACKDROP_CLASS} sx={actionBackdropSx} />
      ) : null}
      <Box component="span" sx={glyphLayerSx}>
        <ActionGlyph icon={action.icon} pressed={pressed} />
      </Box>
    </>
  );
}

// The wired action is ONE native `<button type="button">` (the `type` is
// mandatory — an untyped button submits an enclosing form) named entirely by
// `aria-label`, because an icon-only control has no visible text for the name to
// contain. No key handlers: a native button already fires on Enter and Space,
// and a manual handler would double-fire on Space (S6). `aria-pressed` appears
// only on a real toggle and then in BOTH states; the danger lane's red plate is
// a POINTER state and deliberately carries no `aria-pressed` — it is not a
// toggle. A disabled action keeps the `aria-disabled` boundary: still a real,
// focusable button whose activation no-ops in the model, so keyboard focus is
// never dropped when a focused action flips disabled, and it stays in tab order.
function WiredAction({ action, state, sx }: Readonly<ActionShellProps>): React.ReactElement {
  return (
    <Box
      component="button"
      type="button"
      id={action.id}
      aria-label={action.label}
      aria-pressed={state.ariaPressed}
      aria-haspopup={state.ariaHasPopup}
      aria-expanded={state.ariaExpanded}
      aria-controls={state.ariaControls}
      aria-disabled={state.ariaDisabled}
      onClick={state.onActivate}
      sx={sx}
    >
      <ActionSlotContent action={action} pressed={state.pressed} />
    </Box>
  );
}

// The unwired action: static, non-interactive paint — no role, no tabindex, no
// name and no ARIA of any kind, not even `aria-disabled` (S2). The content tree
// is identical to the wired branch, and the pressed presentation is deliberately
// NOT painted here, which is why every state recipe keys off attributes this
// branch never has.
function StaticAction({ action, state, sx }: Readonly<ActionShellProps>): React.ReactElement {
  return (
    <Box component="span" id={action.id} sx={sx}>
      <ActionSlotContent action={action} pressed={state.pressed} />
    </Box>
  );
}

export interface ActionButtonProps {
  action: UiActionIconBarAction;
  barDisabled: boolean;
}

/** One action slot; wired or static, switched on the action's own callbacks. */
export function ActionButton({
  action,
  barDisabled,
}: Readonly<ActionButtonProps>): React.ReactElement {
  const state: ActionState = useActionState({ action, barDisabled });
  const sx: SxProps<Theme> = actionButtonSx({ icon: action.icon, interactive: state.interactive });
  if (state.interactive) {
    return <WiredAction action={action} state={state} sx={sx} />;
  }
  return <StaticAction action={action} state={state} sx={sx} />;
}
