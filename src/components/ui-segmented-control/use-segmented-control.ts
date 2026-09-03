import { useDevWarning } from '@/utils/dev-warn';

import {
  accessibleNameWarning,
  blankLabelWarning,
  duplicateValueWarning,
  emptyOptionsWarning,
  unmatchedValueWarning,
  unwiredValueWarning,
} from './segmented-control-warnings';
import type { SegmentedOption, UiSegmentedControlProps } from './types';

// The view model one segment renders from. It keeps the component thin: the
// checked/disabled resolution and the activation gate both live here.
export interface SegmentModel {
  option: SegmentedOption;
  /** `aria-checked`, permanent on a wired segment. */
  checked: boolean;
  /** `aria-disabled` for a disabled wired segment; native `disabled` is never set. */
  ariaDisabled: true | undefined;
  /** Fired on activation; a no-op while disabled or already checked. */
  onActivate: () => void;
}

export interface SegmentedControlModel {
  /** True when `onChange` is present — the control renders as a radio group. */
  interactive: boolean;
  ariaLabel: string | undefined;
  ariaLabelledBy: string | undefined;
  segments: SegmentModel[];
}

/** The two booleans + target value every activation decision is gated on. */
interface ActivationGate {
  disabled: boolean;
  checked: boolean;
  value: string;
}

// Activation is gated in the model layer, before any consumer callback runs: a
// disabled segment swallows it (the `aria-disabled` boundary), and an already
// checked segment fires nothing either (native radio `change` semantics). A
// DECLINED selection leaves `checked` false, so the next activation fires again.
function makeActivate(
  gate: ActivationGate,
  onChange: ((value: string) => void) | undefined
): () => void {
  return (): void => {
    if (gate.disabled || gate.checked) return;
    onChange?.(gate.value);
  };
}

/** The per-render context every segment is resolved against. */
interface SegmentContext {
  value: string;
  groupDisabled: boolean;
  onChange: ((value: string) => void) | undefined;
}

function buildSegment(option: SegmentedOption, ctx: SegmentContext): SegmentModel {
  const checked: boolean = option.value === ctx.value;
  const disabled: boolean = ctx.groupDisabled || option.disabled === true;
  return {
    option,
    checked,
    ariaDisabled: disabled ? true : undefined,
    onActivate: makeActivate({ disabled, checked, value: option.value }, ctx.onChange),
  };
}

function useSegmentedControlWarnings(props: UiSegmentedControlProps): void {
  useDevWarning(unwiredValueWarning(props));
  useDevWarning(emptyOptionsWarning(props));
  useDevWarning(accessibleNameWarning(props));
  useDevWarning(duplicateValueWarning(props));
  useDevWarning(blankLabelWarning(props));
  useDevWarning(unmatchedValueWarning(props));
}

export function useSegmentedControl(props: UiSegmentedControlProps): SegmentedControlModel {
  useSegmentedControlWarnings(props);
  const ctx: SegmentContext = {
    value: props.value ?? '',
    groupDisabled: props.disabled ?? false,
    onChange: props.onChange,
  };
  return {
    interactive: props.onChange != null,
    ariaLabel: props.labelledBy == null ? props.label : undefined,
    ariaLabelledBy: props.labelledBy,
    segments: props.options.map(
      (option: SegmentedOption): SegmentModel => buildSegment(option, ctx)
    ),
  };
}
