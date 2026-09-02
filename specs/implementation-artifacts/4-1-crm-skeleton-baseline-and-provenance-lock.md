# Story 4.1 — CRM Skeleton Baseline and Provenance Lock

- **Issue:** [#24](https://github.com/VilnaCRM-Org/ui-toolkit/issues/24)
- **Epic:** Epic 4 — Skeleton Loading Experience Parity
- **Status:** review
- **Source AC:** `specs/planning-artifacts/epics.md` → _Story 4.1: CRM Skeleton Baseline
  and Provenance Lock_

## Scope

Identify the CRM skeleton source, verify the toolkit's skeleton foundation is that
baseline with exact animation parity (PRD §3.4 — release blocker), and lock the
provenance record so later Epic 4 stories build on a verified base. This story is
documentation + verification: no visual redesign, no animation changes.

## Baseline finding

The toolkit already carries the CRM skeleton implementation — imported with the
earlier CRM/website parity layer — under `src/components/`:

| Toolkit module         | CRM source (`src/components/skeletons/…`) |
| ---------------------- | ----------------------------------------- |
| `ui-skeletons/base.ts` | `base/styles.ts`                          |
| `ui-skeleton-text/`    | `ui-skeleton-text/`                       |
| `ui-skeleton-button/`  | `ui-skeleton-button/`                     |
| `ui-skeleton-input/`   | `ui-skeleton-input/`                      |
| `ui-skeleton-block/`   | `ui-skeleton-block/`                      |
| `auth-skeleton/`       | `auth-skeleton/`                          |

**Source repository:** `git@github.com:VilnaCRM-Org/crm.git`, audited at commit
`0057d7845923b5f32fce7f276d384cdfcab5156c` (MUI 7.3.1). The `website` repository
(`ca13841d91817c160ca42c27bd58af23b4c613f8`, MUI 9.0.1) contains **no** skeleton
components, so no canonical-source conflict exists — `crm` is the sole baseline.

**Reuse rationale:** PRD §3.2 (reuse-first) and §3.4 (skeleton policy) mandate the
`crm` skeleton as baseline. The system is Emotion-keyframes based (no `MuiSkeleton`
theme overrides in either repo), which keeps it portable across the MUI 7 → 9 gap.

## Animation parity verification (line-level diff)

`crm src/components/skeletons/base/styles.ts` vs toolkit
`src/components/ui-skeletons/base.ts` — every animation characteristic is identical:

- **Shimmer keyframes:** `background-position 0% 0 → 100% 0`.
- **Shimmer gradient:** `linear-gradient(90deg, rgba(211,216,224,0) 0%,
rgba(211,216,224,0.6) 49.13%, rgba(211,216,224,0) 100%)`, `backgroundSize`
  `200% 100%`.
- **Timing/easing:** `1.5s ease-in-out infinite alternate` (shimmer and pulse).
- **Shadow pulse keyframes:** `box-shadow 0 7px 20px rgba(211,216,224,0.2) →
0 7px 60px rgba(211,216,224,0.8)`.
- **Constants:** `SKELETON_BORDER_RADIUS '57px'`, `SKELETON_BORDER_COLOR '#E1E7EA'`,
  `SMALL_MOBILE_BREAKPOINT 375` / `_UPPER 376`.

**Documented deviations (non-animation, allowed):** explicit TypeScript annotations,
declaration ordering, and an added `@media (prefers-reduced-motion: reduce)` guard
(accessibility hardening; disables animation only when the OS asks — the animated
path is byte-identical to CRM). No redesign of animation behavior.

## Deliverables

1. `specs/implementation-artifacts/story-dod-template.md` — shared DoD checklist
   (created by this story; referenced by the Epic 4 acceptance criteria).
2. `specs/planning-artifacts/component-provenance.md` — Epic 4 skeleton section
   recording source, rationale, and reference IDs for every skeleton module.
3. `tests/unit/skeleton-crm-parity.test.ts` — a parity lock: asserts the shimmer
   gradient stops, `backgroundSize`, `1.5s ease-in-out infinite alternate` timing,
   pulse shadows, and baseline constants, so any future drift from the CRM
   animation contract fails CI (satisfies "a verified baseline exists" without
   depending on later stories).

## Definition of Done (instantiated from `story-dod-template.md`)

- [x] Changed files listed (this artifact + PR diff).
- [x] Provenance: source `crm@0057d78…`, rationale (PRD §3.2/§3.4), reference IDs
      (#24, CRM paths above, Figma Board D `538:38316` for the design surface).
- [x] Tests: parity lock test added; suite green locally.
- [x] Storybook: no new stories required (no visual change in this story).
- [x] Exports: no export-surface change in this story.
- [x] Parity evidence: line-level diff summarized above; animation contract locked
      by test.
