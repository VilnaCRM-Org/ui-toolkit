import { CSSProperties } from 'react';

import Check from '@/assets/svg/check.svg';

import colorTheme from '../UiColorTheme';

const checkIconUrl: string = typeof Check === 'string' ? Check : Check.src;

type StyleObject = CSSProperties & { [pseudoSelector: string]: StyleObject | string | number };

const baseInputStyles: StyleObject = {
  WebkitAppearance: 'none',
  appearance: 'none',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '0.5rem',
  background: colorTheme.palette.white.main,
  '&:checked': {
    backgroundColor: colorTheme.palette.primary.main,
    border: 'none',
    backgroundImage: `url(${checkIconUrl})`,
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
  },
  '&:disabled': {
    cursor: 'default',
    backgroundColor: colorTheme.palette.grey500.main,
    border: 'none',
  },
};

const baseWrapperStyles: StyleObject = {
  display: 'grid',
  marginRight: '0.813rem',
  padding: '0',
};

export default {
  checkboxWrapper: {
    ...baseWrapperStyles,
    input: {
      ...baseInputStyles,
      border: `1px solid ${colorTheme.palette.grey400.main}`,
      '&:hover': {
        cursor: 'pointer',
        border: `1px solid ${colorTheme.palette.primary.main}`,
      },
    },
  },

  checkboxWrapperError: {
    ...baseWrapperStyles,
    input: {
      ...baseInputStyles,
      cursor: 'pointer',
      border: `1px solid ${colorTheme.palette.error.main}`,
    },
  },
};
