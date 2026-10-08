import { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import { fontFamilies } from '@/utils/font-tokens';
import { colorTokens as colorTheme } from '@/utils/palette-tokens';

import { checkIconBackgroundImage } from './check-icon';

const boxBase: SxProps<Theme> = {
  display: 'block',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '0.5rem',
  boxSizing: 'border-box',
  backgroundColor: colorTheme.palette.white.main,
} as const;

const checkedBox: SxProps<Theme> = {
  border: 'none',
  backgroundColor: colorTheme.palette.primary.main,
  backgroundImage: checkIconBackgroundImage,
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
  '@media (forced-colors: active)': { forcedColorAdjust: 'none' },
};

const focusVisibleBox: SxProps<Theme> = {
  outline: `2px solid ${colorTheme.palette.grey200.main}`,
  outlineOffset: '2px',
  '@media (forced-colors: active)': { outlineColor: 'CanvasText' },
};

const pointerFocusBox: SxProps<Theme> = { outline: 'none' };

const baseCheckbox: SxProps<Theme> = {
  padding: 0,
  marginRight: '0.813rem',
  // Compound selector (.ui-checkbox-box.ui-checkbox-box--checked) so the checked
  // fill wins over the base `.ui-checkbox-box` rule regardless of emitted order —
  // otherwise a checked box renders white instead of the primary fill + check.
  '& .ui-checkbox-box.ui-checkbox-box--checked': checkedBox,
  '&:focus-within .ui-checkbox-box': focusVisibleBox,
  '&:focus-within:not(:has(:focus-visible)) .ui-checkbox-box': pointerFocusBox,
  '&:hover:not(.Mui-disabled) .ui-checkbox-box': {
    cursor: 'pointer',
    borderColor: colorTheme.palette.primary.main,
  },
  '&.Mui-disabled .ui-checkbox-box': {
    cursor: 'default',
    border: 'none',
    backgroundColor: colorTheme.palette.grey500.main,
  },
};

// Applied to the `FormControlLabel` WRAPPER, not the `Checkbox`: the label text
// is a sibling of the input, so it cannot be reached from the checkbox `sx`.
// It carried no family of its own and so resolved to MUI's stock Roboto — a
// face the toolkit never ships. Inter matches the `field-controls`
// label/helper-text convention every other field control uses.
export const formControlLabelSx: SxProps<Theme> = {
  '& .MuiFormControlLabel-label': { fontFamily: fontFamilies.inter },
};

/** The wrapper `sx`: the label recipe first, the consumer's layers merged last. */
export function formControlLabelSxWith(sx: SxProps<Theme> | undefined): SxProps<Theme> {
  const extra: SxProps<Theme> = sx ?? {};
  return [formControlLabelSx, ...(Array.isArray(extra) ? extra : [extra])];
}

export default {
  checkbox: {
    ...baseCheckbox,
    '& .ui-checkbox-box': {
      ...boxBase,
      border: `1px solid ${colorTheme.palette.grey400.main}`,
    },
  },
  checkboxError: {
    ...baseCheckbox,
    '& .ui-checkbox-box': {
      ...boxBase,
      border: `1px solid ${colorTheme.palette.error.main}`,
    },
  },
};
