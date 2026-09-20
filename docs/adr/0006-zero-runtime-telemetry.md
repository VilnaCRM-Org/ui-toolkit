# 0006 — Zero runtime telemetry

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

`@sentry/react`, `@sentry/node` and `web-vitals` were declared in `package.json` and imported
nowhere. A component library that reports errors or vitals on its own would do so from inside
every consumer, with the consumer's users and without the consumer's consent or configuration.

## Considered options

- Wire the declared SDKs and expose configuration for them.
- Ship an optional reporting hook the consumer can enable.
- Ship no telemetry at all and make the consuming application the only place that reports.

## Decision outcome

No telemetry. The components render and emit callbacks; nothing in the package phones home.
Error reporting is the consumer's responsibility, through its own React error boundary and,
since issue #71, the toolkit's `UiErrorBoundary` `onError` callback. The unused SDKs were removed, and
`make lint-unused-deps` fails on any declared package the source tree does not reference, so a
reporting SDK cannot sit in `package.json` waiting to be wired.

## Consequences

- The package carries no network surface, which keeps the privacy and supply-chain review of a
  consumer unchanged when it adopts the toolkit.
- Instrumentation needs are raised as an issue first and land as a consumer-facing seam, never
  as a dependency added ahead of the code that would use it.
