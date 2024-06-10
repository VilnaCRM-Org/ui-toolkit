import breakpointsTheme from '@/components/UiBreakpoints';
import colorTheme from '@/components/UiColorTheme';
import { golos } from '@/config/Fonts/golos';

export default {
  wrapper: {
    marginBottom: '0.75rem',
    borderTop: `1px solid  ${colorTheme.palette.brandGray.main}`,
    background: colorTheme.palette.white.main,
    boxShadow:
      ' 0px -5px 46px 0px rgba(198, 209, 220, 0.25), 0px -5px 46px 0px rgba(198, 209, 220, 0.25)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '1.125rem',
    paddingBottom: '0.75rem',
    '@media (max-width: 350px)': {
      gap: '0.5rem',
    },
  },

  copyright: {
    fontFamily: golos.style.fontFamily,
    paddingBottom: '1.25rem',
    color: colorTheme.palette.grey200.main,
    textAlign: 'center',
    width: '100%',
    mt: '1rem',
  },

  listWrapper: {
    gap: '0.5rem',
    justifyContent: 'center',
    [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
      gap: '0.25rem',
    },
    '@media (max-width: 350px)': {
      gap: '0',
    },
  },
};
