import type { SxProps, TextFieldProps, Theme } from '@mui/material';

import type { OptionsRecord } from '@/utils/ui-theme';

import { inputSlotStyles, type InputSlotStyles } from './slot-styles';
import type { UiInputProps } from './types';

type SlotProps = NonNullable<UiInputProps['slotProps']>;
type SxArray = ReadonlyArray<SxProps<Theme>>;

function toSxArray(sx: unknown): SxArray {
  if (sx == null) return [];
  return Array.isArray(sx) ? (sx as SxArray) : [sx as SxProps<Theme>];
}

function prependSx(own: OptionsRecord, value: unknown): OptionsRecord {
  const record: OptionsRecord = (value ?? {}) as OptionsRecord;
  return { ...record, sx: [own, ...toSxArray(record.sx)] };
}

function wrapSlot(own: OptionsRecord, slot: unknown): unknown {
  if (typeof slot === 'function') {
    return (ownerState: unknown): OptionsRecord =>
      prependSx(own, (slot as (state: unknown) => unknown)(ownerState));
  }
  return prependSx(own, slot);
}

function styleInputValue(styles: InputSlotStyles, value: unknown): OptionsRecord {
  const withSx: OptionsRecord = prependSx(styles.inputRoot, value);
  const nested: OptionsRecord = (withSx.slotProps ?? {}) as OptionsRecord;
  return {
    ...withSx,
    slotProps: {
      ...nested,
      notchedOutline: wrapSlot(styles.notchedOutline, nested.notchedOutline),
    },
  };
}

function wrapInputSlot(styles: InputSlotStyles, slot: unknown): unknown {
  if (typeof slot === 'function') {
    return (ownerState: unknown): OptionsRecord =>
      styleInputValue(styles, (slot as (state: unknown) => unknown)(ownerState));
  }
  return styleInputValue(styles, slot);
}

export function styledSlotProps(theme: Theme, slotProps: UiInputProps['slotProps']): SlotProps {
  const styles: InputSlotStyles = inputSlotStyles(theme);
  const own: SlotProps = slotProps ?? {};
  return {
    ...own,
    input: wrapInputSlot(styles, own.input),
    inputLabel: wrapSlot(styles.inputLabel, own.inputLabel),
    formHelperText: wrapSlot(styles.formHelperText, own.formHelperText),
  } as SlotProps;
}

export function inputRootSx(theme: Theme, sx: TextFieldProps['sx']): SxProps<Theme> {
  return [inputSlotStyles(theme).root, ...toSxArray(sx)] as SxProps<Theme>;
}
