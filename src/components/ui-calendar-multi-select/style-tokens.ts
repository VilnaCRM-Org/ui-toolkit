// Design tokens shared by the calendar's style modules: the theme palette, the
// Figma grid geometry and the mobile breakpoint.
import type { Theme } from '@mui/material';

import colorTheme from '@/components/ui-color-theme';

import { crmBreakpointValues } from '../ui-breakpoints';

// Mobile breakpoint from the CRM scale (480px), not hardcoded.
export const MOBILE_MAX: string = `@media (max-width: ${crmBreakpointValues.sm}px)`;

// Design tokens reused from the shared colour theme so the calendar matches the
// field controls (8px radius, grey400 stroke, brand-blue selection, danger error
// stroke, disabled greying) without duplicating hex values.
export const palette: Theme['palette'] = colorTheme.palette;

export type CalendarSize = 'small' | 'medium';

// Figma lays the seven 24px day circles out with `justify-between` across a fixed
// grid width, so the outer circles sit flush to the grid edges and the six inner
// gaps are equal (≈15.3px at the medium size — the range band then runs edge-to-
// edge behind them). 24px is also the WCAG 2.5.8 target-size floor. The grid width
// is `7×24 + 6×gap`: medium = 260px (card 308px with the 24px padding, matching
// Figma node 606:42007), small keeps the tighter ~10px gap.
export const CIRCLE_PX: number = 24;
export const GRID_PX: Record<CalendarSize, number> = { small: 228, medium: 260 };
export const BAND: string = 'rgba(30, 174, 255, 0.1)';
