# 0005 — Release as a GitHub release asset, not through npm

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

The toolkit has two internal consumers (`crm`, `website`) and no public audience yet.
Publishing to the npm registry needs an organisation scope, publish tokens or trusted publishing,
and a licensing/IP clearance the release-readiness story (#34) still owns.

## Considered options

- Publish `@vilnacrm/ui-toolkit` to the public npm registry from `main`.
- Publish to a private registry the consumers authenticate against.
- Attach the packed tarball to a GitHub release and let consumers depend on the asset URL.

## Decision outcome

A push to `main` runs the `autorelease` workflow: `TriPSs/conventional-changelog-action`
computes the next version from the Conventional Commits headers the commit gate enforces, writes
`CHANGELOG.md`, and the workflow tags the release and attaches
`vilnacrm-ui-toolkit-<version>.tgz` (`make package`). The repository is public, so the asset
downloads without a token; `CONSUMING.md` is the consumer-side brief. `make lint-release-version`
keeps `package.json` at or above the highest tag so the computed version always lands above every
existing tag.

## Consequences

- No registry credentials exist in the pipeline; the only privileged step is the push of the
  version commit and tag to the protected `main`, which the release GitHub App performs as a
  bypass actor.
- Consumers pin a release by URL and verify the recorded `sha512`; moving to a later release is
  an explicit edit, never an automatic range resolution.
- The workflow attests build provenance for the tarball (`actions/attest-build-provenance`),
  and `publishConfig.provenance` makes a future `npm publish` carry provenance too.
- Promotion to the public registry is a separate decision, recorded when #34's licensing and IP
  gates are in place; this record is then superseded.
