import type { SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';

import colorTheme from '@/components/ui-color-theme';
import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import { mergeFieldStyles, outlinedFieldStyles, type FieldSlotStyles } from '../field-controls';

import type { UiMultiSelectOption, UiMultiSelectProps } from './types';

export { srOnlySx } from '../field-controls';

const palette: Theme['palette'] = colorTheme.palette;

export const chipSx: SxProps<Theme> = {
  height: 'auto',
  borderRadius: '0.5rem',
  backgroundColor: alpha(palette.primary.main, 0.1),
  border: '1px solid transparent',
  color: palette.primary.main,
  fontFamily: fontFamilies.inter,
  fontSize: '1rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
  letterSpacing: 0,
  '& .MuiChip-label': {
    padding: '0.5625rem 0 0.5625rem 0.75rem',
  },
  '& .MuiChip-deleteIcon': {
    margin: '0 0.75rem 0 0.25rem',
  },
  '&:hover': {
    borderColor: palette.primary.main,
    '& .ui-chip-x': {
      backgroundColor: palette.primary.main,
      color: palette.white.main,
    },
  },
  '&.Mui-disabled': { opacity: 0.6 },
};
export const deleteButtonSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  padding: 0,
  cursor: 'pointer',
};

export const deleteCircleSx: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: 'transparent',
  color: palette.primary.main,
};

type SlotStyle = SystemStyleObject<Theme>;

const EMPTY_VALUE: UiMultiSelectOption[] = [];

const FILLED_STROKE_SX: SlotStyle = {
  '& .MuiOutlinedInput-notchedOutline': { borderColor: colorTheme.palette.grey300.main },
};

const HIDE_CLEAR_SX: SlotStyle = {
  '& .MuiAutocomplete-clearIndicator': { display: 'none' },
};

export function multiSelectRootSx(config: UiMultiSelectProps): SxProps<Theme> {
  const consumerSx: SxProps<Theme> = config.sx ?? {};
  const derived: SlotStyle[] = [
    ...((config.value ?? EMPTY_VALUE).length > 0 ? [FILLED_STROKE_SX] : []),
    ...(config.loading === true ? [HIDE_CLEAR_SX] : []),
  ];
  if (derived.length === 0) {
    return consumerSx;
  }
  return [...derived, ...(Array.isArray(consumerSx) ? consumerSx : [consumerSx])];
}

const AUTOCOMPLETE_ROOT_SX: SlotStyle = {
  '& .MuiAutocomplete-inputRoot': {
    minHeight: '4rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem',
    paddingLeft: '0.625rem',
    paddingRight: '0.875rem',
  },
  '& .MuiAutocomplete-input': {
    padding: 0,
    paddingLeft: '1.0625rem',
  },
  '& .MuiAutocomplete-endAdornment': {
    top: '1rem',
    transform: 'none',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
  },
};

export function multiSelectComboboxSx(config: UiMultiSelectProps): SxProps<Theme> {
  const rest: SxProps<Theme> = multiSelectRootSx(config);
  return [AUTOCOMPLETE_ROOT_SX, ...(Array.isArray(rest) ? rest : [rest])];
}

function outlinedInputOverrides(theme: Theme): Partial<FieldSlotStyles> {
  const { palette } = theme;
  return {
    inputRoot: {
      fontFamily: fontFamilies.inter,
      fontSize: '1rem',
      lineHeight: '1.125rem',
      color: palette.darkPrimary.main,
      '&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
        borderColor: palette.grey300.main,
      },
    },
    htmlInput: {
      '&::placeholder': {
        fontSize: '1rem',
        lineHeight: '1.125rem',
      },
    },
    notchedOutline: {
      borderColor: palette.grey400.main,
    },
  };
}

export const multiSelectFieldStyles: (theme: Theme) => FieldSlotStyles = cacheByTheme(
  (theme: Theme): FieldSlotStyles =>
    mergeFieldStyles(outlinedFieldStyles(theme), outlinedInputOverrides(theme))
);

function popupIndicatorStyles(theme: Theme): SlotStyle {
  return {
    color: theme.palette.grey300.main,
    marginRight: '0.9375rem',
  };
}

function clearIndicatorStyles(theme: Theme): SlotStyle {
  return {
    visibility: 'visible',
    color: theme.palette.grey300.main,
    marginRight: '0.125rem',
    '& svg': { fontSize: '1.5rem' },
  };
}

function paperStyles(theme: Theme): SlotStyle {
  return {
    borderRadius: '0.5rem',
    border: `1px solid ${theme.palette.grey400.main}`,
    boxShadow: '0px 8px 27px 0px rgba(49, 59, 67, 0.14)',
    marginTop: '0.5rem',
  };
}

function optionStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    minHeight: '3.25rem',
    paddingLeft: '1.1875rem',
    fontFamily: fontFamilies.inter,
    fontSize: '1rem',
    fontWeight: 500,
    color: palette.darkPrimary.main,
    '&.Mui-focused': {
      backgroundColor: palette.backgroundGrey100.main,
    },
    '&[aria-selected="true"]': {
      backgroundColor: 'rgba(30, 174, 255, 0.1)',
    },
    '&[aria-selected="true"].Mui-focused': {
      backgroundColor: 'rgba(30, 174, 255, 0.1)',
    },
  };
}

function listboxStyles(theme: Theme): SlotStyle {
  return {
    padding: 0,
    '& .MuiAutocomplete-option': optionStyles(theme),
  };
}

export interface MultiSelectSlotStyles {
  popupIndicator: SlotStyle;
  clearIndicator: SlotStyle;
  paper: SlotStyle;
  listbox: SlotStyle;
}

export const multiSelectSlotStyles: (theme: Theme) => MultiSelectSlotStyles = cacheByTheme(
  (theme: Theme): MultiSelectSlotStyles => ({
    popupIndicator: popupIndicatorStyles(theme),
    clearIndicator: clearIndicatorStyles(theme),
    paper: paperStyles(theme),
    listbox: listboxStyles(theme),
  })
);
