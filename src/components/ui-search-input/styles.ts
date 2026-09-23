import type { Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import {
  mergeFieldStyles,
  OPEN_FIELD_POPPER,
  outlinedFieldStyles,
  type FieldSlotStyles,
  type ListboxSlotProps,
} from '../field-controls';
import { crmBreakpointValues } from '../ui-breakpoints';

type SlotStyle = SystemStyleObject<Theme>;

const TABLET_MAX: string = `@media (max-width: ${crmBreakpointValues.md}px)`;
const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

function adornmentStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    '& .MuiInputAdornment-positionStart': {
      color: palette.grey300.main,
      marginRight: '0.625rem',
    },
    '& .MuiInputAdornment-positionEnd': {
      marginLeft: '0.625rem',
    },
    '& .MuiInputAdornment-positionStart svg': {
      [TABLET_MAX]: { width: '1.5rem', height: '1.5rem' },
      [MOBILE_MAX]: { width: '1.25rem', height: '1.25rem' },
    },
    '&:hover:not(.Mui-disabled) .MuiInputAdornment-positionStart': {
      color: palette.primary.main,
    },
    '&.Mui-focused:not(.Mui-disabled) .MuiInputAdornment-positionStart': {
      color: palette.primary.main,
    },
    '&.Mui-disabled .MuiInputAdornment-positionStart': {
      color: palette.grey300.main,
    },
  };
}

function searchInputRootStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    fontFamily: fontFamilies.inter,
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: '1.125rem',
    color: palette.darkPrimary.main,
    [TABLET_MAX]: { fontSize: '1rem' },
    [MOBILE_MAX]: { fontSize: '0.875rem' },
    ...adornmentStyles(theme),
    '&:hover:not(.Mui-focused):not(.Mui-disabled)': {
      boxShadow: '0px 4px 9px 0px rgba(74, 78, 95, 0.1)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      border: `1px solid ${palette.grey400.main}`,
    },
  };
}

export const searchFieldSlotStyles: (theme: Theme) => FieldSlotStyles = cacheByTheme(
  (theme: Theme): FieldSlotStyles =>
    mergeFieldStyles(outlinedFieldStyles(theme), {
      inputRoot: searchInputRootStyles(theme),
      htmlInput: { '&::placeholder': { fontWeight: 500 } },
    })
);

const AUTOCOMPLETE_INPUT_ROOT: SlotStyle = {
  height: '3rem',
  minHeight: '3rem',
  [TABLET_MAX]: { height: '3.25rem', minHeight: '3.25rem' },
  [MOBILE_MAX]: { height: '3rem', minHeight: '3rem' },
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '0.8125rem',
  paddingRight: '0.8125rem',
};

const AUTOCOMPLETE_INPUT: SlotStyle = {
  padding: 0,
  minWidth: 0,
  '&:first-of-type': { paddingLeft: 0 },
};

export const SEARCH_AUTOCOMPLETE_SX: SlotStyle = {
  '& .MuiAutocomplete-inputRoot': AUTOCOMPLETE_INPUT_ROOT,
  '& .MuiAutocomplete-input': AUTOCOMPLETE_INPUT,
  maxWidth: '29.8125rem',
  [TABLET_MAX]: { maxWidth: '22.5rem' },
  [MOBILE_MAX]: { maxWidth: '22.1875rem' },
};

function paperStyles(theme: Theme): SlotStyle {
  return {
    borderRadius: '0.75rem',
    border: `2px solid ${theme.palette.brandGray.main}`,
    boxShadow: '0px 8px 13.5px 0px rgba(49, 59, 67, 0.14)',
    minWidth: '29.5625rem',
    marginTop: '0.125rem',
    [TABLET_MAX]: { marginTop: '0.4375rem' },
    [MOBILE_MAX]: { marginTop: '0.375rem', minWidth: 0 },
  };
}

function optionStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    minHeight: '3.25rem',
    paddingLeft: '1.1875rem',
    fontFamily: fontFamilies.inter,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: palette.darkPrimary.main,
    [TABLET_MAX]: { minHeight: '3.875rem', fontSize: '1rem', paddingLeft: '1.375rem' },
    [MOBILE_MAX]: { minHeight: '3.25rem', fontSize: '0.875rem', paddingLeft: '1.1875rem' },
    '&.Mui-focused': {
      backgroundColor: palette.backgroundGrey100.main,
    },
  };
}

function listboxStyles(theme: Theme): SlotStyle {
  return {
    padding: 0,
    '& .MuiAutocomplete-option': optionStyles(theme),
  };
}

export interface SearchSlotProps {
  paper: { sx: SlotStyle };
  listbox: ListboxSlotProps['listbox'] & { sx: SlotStyle };
  popper?: typeof OPEN_FIELD_POPPER;
}

export function searchSlotProps(
  theme: Theme,
  listbox: ListboxSlotProps,
  open: boolean | undefined
): SearchSlotProps {
  const slotProps: SearchSlotProps = {
    paper: { sx: paperStyles(theme) },
    listbox: { ...listbox.listbox, sx: listboxStyles(theme) },
  };
  return open ? { ...slotProps, popper: OPEN_FIELD_POPPER } : slotProps;
}
