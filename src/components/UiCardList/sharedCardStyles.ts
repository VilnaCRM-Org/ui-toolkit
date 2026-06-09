import breakpointsTheme from '../UiBreakpoints';
import colorTheme from '../UiColorTheme';

/**
 * Card style blocks shared by UiCardList and the standalone UiCardItem card,
 * extracted to avoid duplicated definitions across the two card surfaces.
 */
export const smallWrapper = {
  padding: '2.5rem 2rem 2.5rem 1.563rem',
  borderRadius: '0.75rem',
  border: `1px solid ${colorTheme.palette.grey500.main}`,
  maxHeight: '20.75rem',
  alignItems: 'start',
  [`@media (max-width: ${breakpointsTheme.breakpoints.values.xl - 1}px)`]: {
    padding: '2.125rem 1.875rem 2.125rem 1.563rem',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '2.813rem',
    maxHeight: '11.375rem',
  },
  [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
    flexDirection: 'column',
    padding: '1rem 1.125rem 0rem 1rem',
    gap: '1rem',
    alignItems: 'start',
    minHeight: '15.125rem',
  },
};

export const hoveredCard = {
  cursor: 'pointer',
  color: colorTheme.palette.primary.main,
  textDecoration: 'underline',
  fontWeight: '700',
};

export const smallImage = {
  width: '5rem',
  height: '5rem',
  [`@media (max-width: ${breakpointsTheme.breakpoints.values.sm}px)`]: {
    width: '3.125rem',
    height: '3.125rem',
  },
};

export const largeImage = {
  width: '4.375rem',
  height: '4.375rem',
  [`@media (max-width: ${breakpointsTheme.breakpoints.values.md}px)`]: {
    width: '3.125rem',
    height: '3.125rem',
  },
};
