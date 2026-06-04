# ui-toolkit

React UI component library built with Bun, Storybook, and MUI.

## Stack

- React 19
- MUI 9
- Storybook 10
- TypeScript 6
- Jest for unit tests
- Playwright for browser and visual checks

## Getting Started

Install dependencies:

```bash
bun install
```

Run the common workflows through `make`:

```bash
make build
make lint
make lint-next
make lint-tsc
make storybook-start
make storybook-build
make test-unit
make test-e2e
make test-visual
make lighthouse-desktop
make lighthouse-mobile
```

## Project Layout

- `src/components`: exported UI components, themes, and stories
- `src/index.ts`: library entrypoint
- `.storybook`: Storybook configuration
- `src/test` and `tests`: automated test coverage
- `scripts`: repository helper scripts used by build/test workflows

## Notes

- This repository is a React UI library, not a Next.js app.
- Source code lives under `src`; there is no `pages` app surface.

## Security

Report vulnerabilities through the private reporting guidance in [SECURITY.md](SECURITY.md).

## Contributing

Contribution workflow details live in [CONTRIBUTING.md](CONTRIBUTING.md).
