import { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import Check from '@/assets/svg/check.svg';

import colorTheme from '../UiColorTheme';

const checkIconUrl: string = typeof Check === 'string' ? Check : Check.src;

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
  backgroundImage: `url(${checkIconUrl})`,
  backgroundPosition: 'center center',
  backgroundRepeat: 'no-repeat',
};

const baseCheckbox: SxProps<Theme> = {
  padding: 0,
  marginRight: '0.813rem',
  '& .ui-checkbox-box--checked': checkedBox,
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
