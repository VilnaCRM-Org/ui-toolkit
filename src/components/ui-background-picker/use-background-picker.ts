import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import backgroundPickerWarning from './background-picker-warnings';
import {
  assignTriggerNode,
  usePickerCtx,
  usePickerRefs,
  type PickerCtx,
  type PickerRefs,
} from './picker-refs';
import { cardRootSx, triggerButtonSx, type PickerVisualState } from './styles';
import type { BackgroundOptionGroup, UiBackgroundPickerProps } from './types';
import { usePickerEffects } from './use-picker-effects';

/** The board copy's own trigger text, used when `label` is omitted. */
export const DEFAULT_TRIGGER_LABEL: string = 'Вибрати фон дошки';

export interface BackgroundPickerModel {
  interactive: boolean;
  menuOpen: boolean;
  disabled: boolean;
  triggerId: string;
  menuId: string;
  ariaExpanded: boolean | undefined;
  ariaControls: string | undefined;
  ariaDisabled: true | undefined;
  value: string;
  groups: readonly BackgroundOptionGroup[];
  cardSx: ReturnType<typeof cardRootSx>;
  triggerSx: ReturnType<typeof triggerButtonSx>;
  /** The shared action context; the trigger and the menu build their own handlers from it. */
  ctx: PickerCtx;
  setTriggerRef: React.RefCallback<HTMLButtonElement>;
}

function addGroupSize(sum: number, group: BackgroundOptionGroup): number {
  return sum + group.options.length;
}

function countOptions(groups: readonly BackgroundOptionGroup[]): number {
  return groups.reduce(addGroupSize, 0);
}

interface PickerState {
  interactive: boolean;
  disabled: boolean;
  menuOpen: boolean;
}

/** `disabled` dominates `open`, and an empty option set renders no menu at all. */
function resolvePickerState(props: UiBackgroundPickerProps, optionCount: number): PickerState {
  const interactive: boolean = props.onOpenChange != null;
  const disabled: boolean = props.disabled ?? false;
  const requested: boolean = props.open ?? false;
  const menuOpen: boolean = interactive && !disabled && requested && optionCount > 0;
  return { interactive, disabled, menuOpen };
}

interface PickerInputs {
  groups: readonly BackgroundOptionGroup[];
  optionCount: number;
  state: PickerState;
}

function resolvePickerInputs(props: UiBackgroundPickerProps): PickerInputs {
  const groups: readonly BackgroundOptionGroup[] = props.groups ?? [];
  const optionCount: number = countOptions(groups);
  return { groups, optionCount, state: resolvePickerState(props, optionCount) };
}

// Exported (rather than kept module-private) so the defence-in-depth disabled
// guard is directly unit-testable: every real call site already checks
// `ctx.disabled` before reaching this, so the `disabled` branch is otherwise
// unreachable through the rendered component.
export function useRequestOpen(
  handler: UiBackgroundPickerProps['onOpenChange'],
  disabled: boolean
): (next: boolean) => void {
  return React.useCallback(
    (next: boolean): void => {
      if (!disabled) {
        handler?.(next);
      }
    },
    [disabled, handler]
  );
}

// Bundles the three ref-dependent pieces the rest of the hook only ever
// consumes together: the ref bundle, the gated open request, and the memoised
// action context built from both.
function usePickerContext(
  props: UiBackgroundPickerProps,
  state: PickerState,
  value: string
): { refs: PickerRefs; ctx: PickerCtx } {
  const refs: PickerRefs = usePickerRefs();
  const requestOpen: (next: boolean) => void = useRequestOpen(props.onOpenChange, state.disabled);
  const ctx: PickerCtx = usePickerCtx({
    refs,
    open: state.menuOpen,
    disabled: state.disabled,
    value,
    requestOpen,
    onSelect: props.onChange,
  });
  return { refs, ctx };
}

function useTriggerRefCallback(
  refs: PickerRefs,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): React.RefCallback<HTMLButtonElement> {
  return React.useCallback(
    (node: HTMLButtonElement | null): void =>
      assignTriggerNode({ forwarded: forwardedRef, own: refs.trigger, node }),
    [forwardedRef, refs]
  );
}

function pickerVisualState(state: PickerState): PickerVisualState {
  return { interactive: state.interactive, open: state.menuOpen, disabled: state.disabled };
}

interface ModelInput {
  props: UiBackgroundPickerProps;
  groups: readonly BackgroundOptionGroup[];
  state: PickerState;
  reactId: string;
  value: string;
  ctx: PickerCtx;
  setTriggerRef: React.RefCallback<HTMLButtonElement>;
}

function buildModel(input: Readonly<ModelInput>): BackgroundPickerModel {
  const { props, groups, state, reactId, value, ctx, setTriggerRef } = input;
  const visual: PickerVisualState = pickerVisualState(state);
  const triggerId: string = props.id ?? reactId;
  const menuId: string = `${reactId}-menu`;
  return {
    interactive: state.interactive,
    menuOpen: state.menuOpen,
    disabled: state.disabled,
    triggerId,
    menuId,
    ariaExpanded: state.interactive ? state.menuOpen : undefined,
    ariaControls: state.menuOpen ? menuId : undefined,
    ariaDisabled: state.interactive && state.disabled ? true : undefined,
    value,
    groups,
    cardSx: cardRootSx(visual, props.sx),
    triggerSx: triggerButtonSx(visual),
    ctx,
    setTriggerRef,
  };
}

export function useBackgroundPicker(
  props: UiBackgroundPickerProps,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>
): BackgroundPickerModel {
  const { groups, optionCount, state } = resolvePickerInputs(props);
  useDevWarning(backgroundPickerWarning(props, optionCount));
  const reactId: string = React.useId();
  const value: string = props.value ?? '';
  const { refs, ctx } = usePickerContext(props, state, value);
  const setTriggerRef: React.RefCallback<HTMLButtonElement> = useTriggerRefCallback(
    refs,
    forwardedRef
  );
  usePickerEffects(ctx);
  return buildModel({ props, groups, state, reactId, value, ctx, setTriggerRef });
}
