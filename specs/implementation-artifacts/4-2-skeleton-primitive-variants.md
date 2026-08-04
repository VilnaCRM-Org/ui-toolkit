# Story 4.2 — Skeleton Primitive Variants

- **Issue:** [#25](https://github.com/VilnaCRM-Org/ui-toolkit/issues/25)
- **Epic:** Epic 4 — Skeleton Loading Experience Parity
- **Status:** in-progress
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
  "Block image"; round renders a circle (design default 48×48), block a rounded
  rectangle (design default 260×195, radius measured from Figma).
- Shared toolkit props: `id?`, `width?`, `height?`, `sx?` (dimension overrides
  follow the `UiSkeletonBlock` prop shape).
- Styling reuses `baseSkeletonStyle` (shimmer + reduced-motion guard) verbatim.

### `UiSkeletonText` many-lines support (extend, no breaking change)

- New `lines?: number` (default `1`) — `1` keeps today's markup byte-identical.
- `lines > 1` stacks bars at the Board D pitch (8px bar height per line as
  designed for the many-lines pattern, 6px gap) with the design's tapering
  widths (full → ~4/5 → ~1/2, from 197/157/96), last line always tapered.
- Existing `size`/`width`/`id`/`sx` contract unchanged.

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

- [ ] Changed files listed in the PR diff and summarized here on completion.
- [ ] Provenance: `component-provenance.md` rows for `ui-skeleton-image` (source:
      `new`, visuals from Board D nodes, animation from `crm` baseline) and the
      `ui-skeleton-text` extension.
- [ ] Tests run: unit suite green with new coverage; visual baselines pass.
- [ ] Stories added and registered.
- [ ] Export changes recorded (`UiSkeletonImage`).
- [ ] Parity evidence: measured geometry vs node map recorded in the PR.
