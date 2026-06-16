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
