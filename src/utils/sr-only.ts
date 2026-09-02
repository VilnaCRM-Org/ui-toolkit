import type { SxProps, Theme } from '@mui/material';

/**
 * Visually hidden, but still exposed to assistive technology — the standard
 * clip-rect technique. Shared by every field control that owns a live region
 * (`role="status"` / `role="alert"`) or a supplementary label that must be
 * announced without being painted, and by the composed skeleton shell for its
 * status text.
 *
 * It lives in `utils/` rather than under `field-controls/` because two component
 * families need it, and the only boundary-legal way to reach across component
 * directories is the target's barrel (`components-public-api`). Importing this
 * one style through `field-controls/index.ts` would pull that whole graph —
 * `GhostOverlay` included — into every consumer's module tree, which makes each
 * skeleton suite a "related test" of every field control and inflates the
 * mutation gate's per-mutant Jest run (38 suites for `ghost-overlay.tsx`, vs 26
 * without this edge). `utils/` is outside the component-boundary rule, so the
 * leaf can be imported directly.
 */
const srOnlySx: SxProps<Theme> = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default srOnlySx;
