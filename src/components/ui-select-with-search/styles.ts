import type { SxProps, Theme } from '@mui/material';
import type { SystemStyleObject } from '@mui/system';

import { fontFamilies } from '@/utils/font-tokens';
import { cacheByTheme } from '@/utils/ui-theme';

import { mergeFieldStyles, outlinedFieldStyles, type FieldSlotStyles } from '../field-controls';

import type { UiSelectWithSearchProps } from './types';

type SlotStyle = SystemStyleObject<Theme>;

const GOLOS_VALUE_TYPE = {
  fontFamily: fontFamilies.golos,
  fontSize: '0.9375rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
} as const;

function fieldOverrides(theme: Theme): Partial<FieldSlotStyles> {
  const { palette } = theme;
  return {
    inputRoot: { ...GOLOS_VALUE_TYPE, color: palette.darkSecondary.main },
    notchedOutline: { borderColor: palette.brandGray.main },
    htmlInput: {
      '&::placeholder': {
        fontFamily: fontFamilies.golos,
        fontWeight: 500,
        fontSize: '0.9375rem',
        lineHeight: '1.125rem',
      },
    },
  };
}

export const selectFieldStyles: (theme: Theme) => FieldSlotStyles = cacheByTheme(
  (theme: Theme): FieldSlotStyles =>
    mergeFieldStyles(outlinedFieldStyles(theme), fieldOverrides(theme))
);

const INPUT_ROOT_STYLES: SlotStyle = {
  height: '3rem',
  minHeight: '3rem',
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: '1.25rem',
  paddingRight: '0.875rem',
};

const INPUT_STYLES: SlotStyle = { padding: 0, minWidth: 0 };

function openStateStyles(theme: Theme): SlotStyle {
  const { palette } = theme;
  return {
    '&.Mui-expanded .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.grey400.main,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    '&.Mui-expanded .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: palette.grey400.main,
    },
    '&:not(.Mui-expanded)': {
      '.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: palette.brandGray.main,
      },
    },
  };
}

export const autocompleteRootStyles: (theme: Theme) => SlotStyle = cacheByTheme(
  (theme: Theme): SlotStyle => ({
    '& .MuiAutocomplete-inputRoot': INPUT_ROOT_STYLES,
    '& .MuiAutocomplete-input': INPUT_STYLES,
    ...openStateStyles(theme),
  })
);

const HIDE_CLEAR_SX: SlotStyle = {
  '& .MuiAutocomplete-clearIndicator': { display: 'none' },
};

function toSxArray(sx: SxProps<Theme> | undefined): ReadonlyArray<SxProps<Theme>> {
  if (sx === undefined) return [];
  return Array.isArray(sx) ? sx : [sx];
}

export function selectRootSx(control: UiSelectWithSearchProps): SxProps<Theme> | undefined {
  if (control.loading !== true) {
    return control.sx;
  }
  const consumerSx: SxProps<Theme> = control.sx ?? {};
  return [HIDE_CLEAR_SX, ...(Array.isArray(consumerSx) ? consumerSx : [consumerSx])];
}

export function selectSx(theme: Theme, control: UiSelectWithSearchProps): SxProps<Theme> {
  return [autocompleteRootStyles(theme), ...toSxArray(selectRootSx(control))] as SxProps<Theme>;
}
