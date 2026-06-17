# Integration tests

These tests render **composed** components with their **real children** (no child
mocks) and assert cross-component behaviour — the tier above `tests/unit`, which
isolates a single component (often mocking its children).

Run with `make test-integration` (or `jest --config jest.integration.config.ts`).

## Why no MSW

The CRM's integration tests use [Mock Service Worker](https://mswjs.io/) to stub
API responses. `ui-toolkit` is a presentational component library — **no
component performs network I/O** (verified: no `fetch`/Apollo/axios usage under
`src/components`). There is therefore nothing for MSW to intercept, so it is
intentionally omitted. If a future component gains data-fetching behaviour, add
`msw` + a `tests/integration/setup.ts` server here, mirroring the CRM.

## Scope

Composed components under test: AuthSkeleton (skeleton primitives), UiCardList
(CardGrid/CardSwiper → UiCardItem → CardContent → UiImage/UiTooltip), UiFooter
(DefaultFooter/Mobile/SocialMediaItem/VilnaCRMEmail), UiForm (react-hook-form +
inputs), Layout (header/footer/children + document metadata), UiTextFieldForm.

## Coverage

Like the unit tier (and the CRM), the integration run enforces a **100% coverage
gate** (`coverageThreshold` in `jest.integration.config.ts`) — but scoped via
`collectCoverageFrom` to the **composition/orchestration** files it owns:
`AuthSkeleton`, `Layout`, `UiForm`, `UiTextFieldForm`, and the `UiFooter` /
`UiCardList` subtrees.

Out of scope here (covered fully by the unit tier instead):

- **Leaf components** (Button, Input, Checkbox, Tooltip, skeleton primitives,
  Link, Image, Typography, …) — integration only verifies that they _compose_,
  not their exhaustive internal logic.
- **`theme.ts` / `styles.ts` / `*-styles.ts` / `constants.ts` / `types.ts` /
  barrels** — mirroring the CRM's exclusion of theme/style modules.
- **`UiCardList/CardSwiper.tsx`** (its `MutationObserver` branches need the unit
  tier's mock-driven simulation) and **`UiCardList/CardGrid.tsx`** (its
  empty-list branch is unreachable through `UiCardList`, which requires a
  non-empty list).
