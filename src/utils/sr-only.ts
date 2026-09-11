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
 * one style through `field-controls/index.ts` would pull that whole graph into
 * every consumer's module tree, which makes each skeleton suite a "related test"
 * of every field control and inflates the mutation gate's per-mutant Jest run.
 * `utils/` is outside the component-boundary rule, so the leaf can be imported
 * directly.
 *
 * The same reasoning later moved `GhostOverlay` out of the `field-controls`
 * barrel and into its own component directory (`../components/ghost-overlay`):
 * a `.tsx` file has to stay under `src/components/` to remain in the mutation
 * scope, so it got a directory and a barrel of its own rather than a home in
 * `utils/`. Its fan-out went 32 suites -> 9, and shard 1 of the mutation gate
 * back under its job budget.
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
