[![SWUbanner](./public/supportUkraine.svg)](https://supportukrainenow.org/)

# Template for modern SSR applications

[![CodeScene Code Health](https://codescene.io/projects/43861/status-badges/code-health)](https://codescene.io/projects/43861)
[![CodeScene System Mastery](https://codescene.io/projects/43861/status-badges/system-mastery)](https://codescene.io/projects/43861)
[![codecov](https://codecov.io/gh/VilnaCRM-Org/frontend-ssr-template/graph/badge.svg?token=MPFDUSMZ2I)](https://codecov.io/gh/VilnaCRM-Org/frontend-ssr-template)

## Possibilities

- Modern JavaScript stack for services: [React](https://react.dev/), [Next.js](https://nextjs.org/)
- A lot of CI checks to ensure the highest code quality that can be
  (Security checks, Code style fixer, static linters, DeepScan, Snyk)
- Configured testing tools: [Playwright](https://playwright.dev/), [Jest](https://jestjs.io/)
- This template is based on [bulletproof-react](https://github.com/alan2207/bulletproof-react/tree/master)
- Much more!

## Why you might need it

Many front-end developers need to create new projects from scratch and spend a lot of time.

We decided to simplify this exhausting process and create a public template for modern
front-end applications. This template is used for all our microservices in VilnaCRM.

## License

This software is distributed under the
[Creative Commons Zero v1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/deed) license.
Please read [LICENSE](https://github.com/VilnaCRM-Org/frontend-ssr-template/blob/main/LICENSE) for information
on the software availability and distribution.

### Minimal installation

You can clone this repository locally or use Github functionality "Use this template"

Install [node.js](https://nodejs.org/en/) 20 version or higher and [Bun](https://bun.sh/)

Use `bun install` for installing all dependencies. Run project workflows through `make`.

## Using

The list of possibilities

```bash
make build - build application
make lint - run all linters
make lint-next - ESLint
make lint-tsc - static TypeScript lint
make test-e2e - end-to-end testing
make test-e2e-local - open Playwright test runner
make test-unit - unit testing
make lighthouse-desktop - lighthouse desktop testing
make lighthouse-mobile - lighthouse mobile testing
```

## Documentation

Start reading at the [GitHub wiki](https://github.com/VilnaCRM-Org/frontend-ssr-template/wiki).
If you're having trouble, head for
[the troubleshooting guide](https://github.com/VilnaCRM-Org/frontend-ssr-template/wiki/Troubleshooting)
as it's frequently updated.

You can generate complete API-level documentation by running `doc` in the top-level
folder, and documentation will appear in the `docs` folder, though you'll need to have
[API-Extractor](https://api-extractor.com/) installed.

If the documentation doesn't cover what you need, search the
[many questions on Stack Overflow](http://stackoverflow.com/questions/tagged/vilnacrm),
and before you ask a question,
[read the troubleshooting guide](https://github.com/VilnaCRM-Org/frontend-ssr-template/wiki/Troubleshooting).

## Tests

[Tests](https://github.com/VilnaCRM-Org/frontend-ssr-template/actions)

If this isn't passing, is there something you can do to help?

## Security

Please disclose any vulnerabilities found responsibly – report security issues to the maintainers privately.

See
[SECURITY](https://github.com/VilnaCRM-Org/frontend-ssr-template/tree/main/SECURITY.md)
and
[Security advisories on GitHub](https://github.com/VilnaCRM-Org/frontend-ssr-template/security).

## Contributing

Please submit bug reports, suggestions, and pull requests to the
[GitHub issue tracker](https://github.com/VilnaCRM-Org/frontend-ssr-template/issues).

We're particularly interested in fixing edge cases, expanding test coverage,
and updating translations.

If you found a mistake in the docs, or want to add something, go ahead and
amend the wiki – anyone can edit it.

## Sponsorship

Development time and resources for this repository are provided by
[VilnaCRM](https://vilnacrm.com/),
the free and opensource CRM system.

Donations are very welcome, whether in beer 🍺, T-shirts 👕, or cold, hard cash 💰.
Sponsorship through GitHub is a simple and convenient way to say "thank you" to
maintainers and contributors – just click the "Sponsor" button
[on the project page](https://github.com/VilnaCRM-Org/frontend-ssr-template).
If your company uses this template, consider taking part in the VilnaCRM's enterprise support program.

## Changelog

See [changelog](CHANGELOG.md).
