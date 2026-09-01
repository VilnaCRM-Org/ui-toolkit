import React from 'react';

import { useDevWarning } from '@/utils/dev-warn';

import { hasHelperContent, hasText } from '../field-controls';

import { buildPinHandlers, type PinCellHandlers } from './pin-cell-handlers';
import usePinCellRefs, { type PinCellRefs } from './pin-cell-refs';
import pinInputWarning from './pin-input-warnings';
import { pinAxes, type PinAxes } from './pin-value';
import type { UiPinInputProps } from './types';

/** How the group is named: `labelledBy` wins, and only one of the two is set. */
export interface PinGroupAria {
  label: string | undefined;
  labelledBy: string | undefined;
}

/** Per-cell ARIA. `aria-required` reaches the FIRST cell only, via the view. */
export interface PinCellAria {
  /** The Ruling-3 disabled mechanism; also what keeps a static field controlled. */
  readOnly: boolean;
  ariaDisabled: true | undefined;
  ariaInvalid: true | undefined;
  ariaRequired: true | undefined;
  describedBy: string | undefined;
}

export interface PinInputModel {
  axes: PinAxes;
  group: PinGroupAria;
  cell: PinCellAria;
  handlers: PinCellHandlers;
  helperTextId: string | undefined;
  setCell: (index: number) => React.RefCallback<HTMLInputElement>;
}

interface PinCellAriaInput {
  props: UiPinInputProps;
  axes: PinAxes;
  helperTextId: string | undefined;
}

interface PinModelInput {
  props: UiPinInputProps;
  baseId: string;
  refs: PinCellRefs;
}

// `aria-disabled` follows the repo one-liner — it is a statement about an
// interactive control, so a static field never claims it. `readOnly` is wider:
// it also covers the static branch, where it is what keeps a controlled input
// from warning about a missing `onChange`. Native `disabled` appears nowhere.
function pinCellAria(input: Readonly<PinCellAriaInput>): PinCellAria {
  const { props, axes } = input;
  return {
    readOnly: !axes.interactive || axes.disabled,
    ariaDisabled: axes.interactive && axes.disabled ? true : undefined,
    ariaInvalid: props.error === true ? true : undefined,
    ariaRequired: props.required === true ? true : undefined,
    describedBy: input.helperTextId,
  };
}

function buildPinModel(input: Readonly<PinModelInput>): PinInputModel {
  const { props, refs } = input;
  const axes: PinAxes = pinAxes(props);
  const helperTextId: string | undefined = hasHelperContent(props.helperText)
    ? `${input.baseId}-helper-text`
    : undefined;
  const labelledBy: string | undefined = hasText(props.labelledBy) ? props.labelledBy : undefined;
  return {
    axes,
    group: { label: labelledBy == null ? props.label : undefined, labelledBy },
    cell: pinCellAria({ props, axes, helperTextId }),
    handlers: buildPinHandlers({ axes, focusCell: refs.focusCell, onChange: props.onChange }),
    helperTextId,
    setCell: refs.setCell,
  };
}

/**
 * The view model the field renders from: the always-controlled axes, the group
 * and per-cell ARIA, the three cell handlers and the cell registry. It keeps the
 * component itself a shell — no branch in the JSX decides semantics.
 */
export function usePinInput(props: UiPinInputProps): PinInputModel {
  useDevWarning(pinInputWarning(props));
  // `useId` must run every render (Rules of Hooks); a caller-supplied `id` wins.
  const reactId: string = React.useId();
  const refs: PinCellRefs = usePinCellRefs();
  return buildPinModel({ props, baseId: props.id ?? reactId, refs });
}
