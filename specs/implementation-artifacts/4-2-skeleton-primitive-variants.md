# Story 4.2 — Skeleton Primitive Variants

- **Issue:** [#25](https://github.com/VilnaCRM-Org/ui-toolkit/issues/25)
- **Epic:** Epic 4 — Skeleton Loading Experience Parity
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 4.2: Skeleton Primitive
  Variants_

## Scope

Complete the primitive skeleton set required by Board D (PRD §4.4): `image`
(round + block), `text one-line`, `text many-lines`, and `block`. Text one-line and
block already exist from the CRM baseline (Story 4.1); this story adds the image
primitive and many-lines text support, keeping every variant on the CRM-derived
animation system (`src/components/ui-skeletons/base.ts`) — no new animation code.

## Design sources — Figma node map

File: **VilnaCRM (Copy)**, fileKey `xZ7ccrH6d4QyqLQsayFSEX`. Board D = frame
`538:38316` "Ui kit" (8806×2628), heading "Skeletons", on canvas `439:19251`.

| Pattern         | Node(s)                               | Geometry                        |
| --------------- | ------------------------------------- | ------------------------------- |
| Image (round)   | `538:38680`, `538:38681`              | 48×48 ellipses                  |
| Image (block)   | `538:39442` → `538:39440`             | 260×195 rounded rectangle       |
| Text one line s | `538:38686`                           | 147×8                           |
| Text one line m | `538:38691`                           | 147×12                          |
| Text one line l | `538:38693`                           | 147×18                          |
| Text many lines | `538:38695`, `538:38696`, `538:38697` | 197/157/96 × 8, 14px line pitch |

The one-line sizes map 1:1 onto the existing `UiSkeletonText` `s/m/l` heights
(8/12/18) — the CRM baseline already matches the board design for one-line text.

## Delivery contract

### `UiSkeletonImage` (new, `src/components/ui-skeleton-image/`)

- `variant: 'round' | 'block'` (default `'round'`) per PRD §4.4 "Round image" /
  "Block image"; round renders a circle (design default 48×48, radius `50%`),
  block a rounded rectangle (design default 260×195, radius `8px` as measured
  on `538:39440`).
- Shared toolkit props: `id?`, `width?`, `height?`, `sx?`. Unlike
  `UiSkeletonBlock`, `width`/`height` have no literal default: when omitted they
  fall back to the per-variant design geometry, so switching `variant` switches
  both dimensions. Corner radius is variant-owned and not overridable via a
  prop (pass `sx` to change it), because it is what distinguishes the two
  patterns.
- Styling reuses `baseSkeletonStyle` (shimmer + reduced-motion guard) verbatim;
  the solid `#E5E9ED` fill on the static Figma frame `538:38680` is the rest
  frame of that same shimmer (`538:38681` carries the D3D8E0 0/0.6/0 gradient),
  so no fill colour is introduced.

### `UiSkeletonText` many-lines support (extend, no breaking change)

- New `lines?: number` (default `1`) — `1` keeps today's markup byte-identical
  (a single `Box`, same styles, no wrapper element).
- `lines > 1` stacks bars at the Board D pitch (8px bar height per line as
  designed for the many-lines pattern, 6px gap) with the design's tapering
  widths (full → ~4/5 → ~1/2, from 197/157/96), last line always tapered. The
  exported taper constants are `FIRST_LINE_WIDTH` `'100%'`, `MIDDLE_LINE_WIDTH`
  `'80%'` (157/197 ≈ 0.797) and `LAST_LINE_WIDTH` `'50%'` (96/197 ≈ 0.487);
  every line between the first and the last uses the middle width.
- `lines > 1` renders a flex-column wrapper `Box` that carries `id`, the
  component `width` and the merged `sx`; the bars themselves are unaddressable
  children, matching the "decorative, id-only" selector convention.
- **Deviation from the drafted contract:** the 8px many-lines row height is a
  _default_, not a fixed value. `size` becomes optional with no destructuring
  default and resolves as `size ?? (lines > 1 ? 's' : 'm')`, so the single-line
  default (`'m'`, 12px) is preserved bit-for-bit while the many-lines pattern
  defaults to the design's `'s'` (8px) row and an explicit `size` still wins for
  both. This keeps one size→height map instead of a second hard-coded height.
- Existing `size`/`width`/`id`/`sx` behaviour is otherwise unchanged.

### `UiSkeletonBlock`

- Already delivered by the CRM baseline; verified as the "generic block
  placeholder" pattern. No change planned.

## Governance / CI gates in scope

- Exports added to `src/components/index.ts`; the export-surface unit test
  updated (`UiSkeletonImage`).
- Unit tests: `tests/unit/ui-skeletons.test.tsx` extended (image variants,
  many-lines rendering, defaults, sx merge, reduced-motion inheritance) —
  mutation-killing assertions on geometry values.
- Storybook stories for image round/block and one/many-lines text; registered in
  `tests/visual/stories.json`; chromium baselines generated in the pinned
  Playwright image.
- Figma parity verified by live measurement against the node map above.
- `rca`, ESLint (no suppressions), `tsc`, Prettier, `depcruise` all clean.

## Definition of Done (instantiated from `story-dod-template.md`)

- [x] Changed files listed in the PR diff (`ui-skeleton-image/` module,
      `ui-skeleton-text` extension incl. `text-lines.tsx`, export/registry
      wiring, `tests/unit/ui-skeletons.test.tsx`).
- [x] Provenance: `component-provenance.md` rows for `ui-skeleton-image` (source:
      `new`, visuals from Board D nodes, animation from `crm` baseline) and the
      `ui-skeleton-text` extension.
- [x] Tests run: unit suite green with 100% coverage on both touched dirs;
      visual baselines generated and passing.
- [x] Stories added and registered (image Round/Block/CustomSize, text
      ManyLines).
- [x] Export changes recorded (`UiSkeletonImage`).
- [x] Parity evidence: measured geometry (48×48 round, 260×195×8px block,
      197/157/96×8 lines at 14px pitch) recorded above and in the provenance
      registry.
