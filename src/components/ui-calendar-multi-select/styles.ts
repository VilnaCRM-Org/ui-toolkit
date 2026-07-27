// Single styling entry point for the calendar. The rules themselves live in the
// sibling style modules — tokens, outer chrome, grid frame and day cell — so each
// stays small enough to read; colours come from the shared theme and contrast
// hardening is deferred to the accessibility-visuals PR (see Story 1.3).
export { srOnlySx } from '../field-controls';

export { dayCellSx, dayCircleSx } from './day-styles';

export {
  adjacentDaySx,
  dayRowSx,
  gridSx,
  paddingCellSx,
  rowGroupSx,
  weekdayHeadingSx,
  weekRowSx,
} from './grid-styles';

export { BAND, CIRCLE_PX } from './style-tokens';
export type { CalendarSize } from './style-tokens';

export {
  captionSx,
  dividerSx,
  headerSx,
  labelSx,
  mergeRootSx,
  navButtonSx,
  navGroupSx,
  surfaceSx,
} from './surface-styles';
