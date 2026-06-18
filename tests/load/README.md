# Load tests — intentionally not implemented

The sibling CRM repo load-tests its running application's HTTP endpoints with
[k6](https://k6.io/) (smoke / average / stress / spike profiles against routes
such as `/authentication` and `/signup`).

`ui-toolkit` is a **published React + MUI component library**. It ships built
ESM/CSS artifacts and a Storybook for development — it exposes **no runtime HTTP
endpoints or server** that a load test could meaningfully exercise. Load-testing
the static Storybook server would only measure a dev-time static file server,
not anything this package is responsible for.

Accordingly, the load tier is deliberately omitted. The `make load-tests`
target is kept as an explicit, self-documenting no-op so CI parity with the
other VilnaCRM repos stays visible.

If a consuming app needs load coverage for flows that use these components, that
belongs in the **consumer** repo (CRM / website), where the endpoints live.

Performance of the library's rendered output is instead covered by:

- **Lighthouse** (`make lighthouse-desktop` / `make lighthouse-mobile`) against
  Storybook stories — performance, accessibility, best-practices, SEO budgets.
- **Memory-leak** tests (`make test-memory-leak`) — memlab scenarios driving
  Storybook stories to catch retained-memory regressions.
