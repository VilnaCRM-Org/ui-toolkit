# Story 4.3 — Composed Skeleton Layout Variants

- **Issue:** [#26](https://github.com/VilnaCRM-Org/ui-toolkit/issues/26)
- **PR:** [#124](https://github.com/VilnaCRM-Org/ui-toolkit/pull/124)
- **Epic:** Epic 4 — Skeleton Loading Experience Parity
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 4.3: Composed Skeleton
  Layout Variants_

## Scope

Deliver the Board D composed skeleton layouts (PRD §4.4): widget small/medium, menu,
tab bar, button, list, input, checkbox+text, radio+text, and table. Every composed
variant is assembled from the Story 4.1/4.2 primitive foundations and inherits the
CRM-derived animation system unchanged — no new keyframes, timing, or easing.

`button` and `input` map onto the existing CRM-baseline primitives
(`UiSkeletonButton`, `UiSkeletonInput`); this story verifies them against the Board D
nodes and documents any geometry deltas instead of duplicating them as new modules.

## Design sources — Figma node map

File: **VilnaCRM (Copy)**, fileKey `xZ7ccrH6d4QyqLQsayFSEX`, Board D frame
`538:38316` (heading "Skeletons") on canvas `439:19251`.

| Pattern         | Node(s)                                     | Geometry                       |
| --------------- | ------------------------------------------- | ------------------------------ |
| Widget small    | `538:38698`, `538:38709`, `538:38721`,      | 374-376 × 410 cards            |
|                 | `538:39423`, `538:39430`, `632:46278`       |                                |
| Widget medium   | `632:46444`, `632:46445` (2362×410 groups), | 774-wide and wider cards       |
|                 | `632:46446`, `632:46506` (3541×540 groups)  |                                |
| Menu            | `538:39489`                                 | 238×791 sidebar                |
| Tab bar         | `538:39646`                                 | 1132×39, 6 tabs                |
| Button          | `538:39683`                                 | 166×62                         |
| List            | `538:39719`, `538:39713`, `538:39708`       | 590×64 rows (3 variants)       |
| Input           | `538:39789`                                 | 513×91 (label + 64px field)    |
| Checkbox + text | `538:39802`                                 | 179×24 (24px box + 147×18 bar) |
| Radio + text    | `538:39808`                                 | 179×24                         |
| Table           | `538:40309`                                 | 1166×692 (56px header + rows)  |

Structural notes (from board metadata; fills/radii to be measured live):

- **Widget cards** share a 48px header (147×18 title bar + `dots-horizontal` glyph)
  over one of three content types: a **task list** (rows of 34×34 avatar circle,
  two 12px text bars, one 8px meta bar, with a 4px scrollbar affordance), a
  **block** fill area, or a **chart** (bar silhouette). Medium widgets repeat the
  same anatomy at ~774px+ width (task rows become two-column at the widest size).
- **Menu**: six 54px nav rows, one expanded section (24px icon dot, 147×18 title,
  three 115×14 sub-rows), divider, trailing bottom row.
- **Tab bar**: six 147×18 label bars on a ~189px pitch over a full-width 4px
  track with per-tab 4px underline segments.
- **Input**: 147×18 label bar above a 513×64 field with an inner 147×18 bar.
- **Checkbox/radio + text**: 24×24 control placeholder + 147×18 text bar.
- **Table**: 1166×56 header (with chip + `dots-vertical` placeholders) over
  column-aligned rows of text bars.

## Delivery contract

New modules under `src/components/` (kebab-case, one directory each, `Ui` prefix,
shared `id?`/`sx?` props, styling built from `UiSkeleton*` primitives and
`ui-skeletons` base — decorative content marked `aria-hidden` per the Epic 4
accessibility guidance, with a labelled status container where a layout stands
alone):

| Export                  | Directory                   | Variants               |
| ----------------------- | --------------------------- | ---------------------- |
| `UiSkeletonWidget`      | `ui-skeleton-widget/`       | size × content (below) |
| `UiSkeletonMenu`        | `ui-skeleton-menu/`         | single design          |
| `UiSkeletonTabBar`      | `ui-skeleton-tab-bar/`      | `tabs?` (default 6)    |
| `UiSkeletonList`        | `ui-skeleton-list/`         | `rows?` (default 3)    |
| `UiSkeletonControlText` | `ui-skeleton-control-text/` | checkbox / radio       |
| `UiSkeletonTable`       | `ui-skeleton-table/`        | `rows?` / `columns?`   |

`UiSkeletonWidget` variant surface: `size: 'small' | 'medium'` crossed with
`variant: 'task-list' | 'block' | 'chart'` (content anatomy per the structural
notes above), plus `columns: 1 | 2` on the medium task-list — the count doubles
as the board footprint switch (774×410 vs the 1167×540 two-column card).
`UiSkeletonControlText` takes `control: 'checkbox' | 'radio'`.

Measured corrections to the structural notes (live Figma verification during
delivery): the three list nodes are byte-identical 590×64 leaf bars — no
avatar/text anatomy and no cycling variants — so `UiSkeletonList` repeats one
row at the measured 6px gap; the table's "header strip" is five loose 63×14
bars above ten 1166×56 body rows (12px gaps, column tracks 228/196/117/219/324),
giving `UiSkeletonTable` its `rows = 10` / `columns = 5` design defaults; and
the control placeholder's flat `#EBEEF2` fill is rendered with the shimmer
instead (static form of the same grey — no new colours, in-step animation).

Existing `UiSkeletonButton` / `UiSkeletonInput` are the `button` / `input`
patterns; geometry verified against `538:39683` / `538:39789` with deltas (if any)
documented in `component-provenance.md` rather than forked.

## Governance / CI gates in scope

- Exports added to `src/components/index.ts`; export-surface unit test updated.
- Unit tests per module under `tests/unit/` (descriptive filenames), covering
  render anatomy, variant/prop branches, animation inheritance, reduced-motion,
  sx passthrough — mutation-killing assertions on counts and geometry.
- Storybook stories per variant; registered in `tests/visual/stories.json`;
  chromium baselines generated in the pinned Playwright image.
- `rca` complexity budget respected (decompose row/section builders); ESLint (no
  suppressions), `tsc`, Prettier, `depcruise` clean; jscpd duplication watched
  across sibling composed modules (shared row/section helpers extracted).
- Figma parity verified by live measurement against the node map.

## Definition of Done (instantiated from `story-dod-template.md`)

- [x] Changed files listed in the PR diff (six component dirs, six unit-test
      files, the shared `ComposedSkeleton` shell, central export/registry
      wiring).
- [x] Provenance rows for every composed module (source: `new` composition of
      the `crm`-baseline animation system; visuals from Board D nodes; ref #26),
      including the button/input coverage verdict.
- [x] Tests run: unit suite green with 100% coverage on every new module.
- [x] Stories added and registered for every delivered variant (15 registry
      entries).
- [x] Export changes recorded (`UiSkeletonControlText`, `UiSkeletonList`,
      `UiSkeletonMenu`, `UiSkeletonTabBar`, `UiSkeletonTable`,
      `UiSkeletonWidget`).
- [x] Parity evidence: measured geometry vs node map recorded above and in the
      provenance registry; visual baselines generated in the pinned Playwright
      image.
