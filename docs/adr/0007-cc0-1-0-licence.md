# 0007 — CC0 1.0 licence

- Status: accepted (backfilled)
- Date: 2026-09-20

## Context and problem statement

The repository is public and its releases are downloadable by anyone, so the licence is part of
the public contract. `LICENSE` is CC0 1.0 Universal and `package.json` declares
`"license": "CC0-1.0"`; scanners and consumers must see the same answer in both places.

## Considered options

- CC0 1.0 — a public-domain dedication with a permissive fallback licence; no attribution
  requirement, no patent grant.
- MIT — permissive with attribution; no explicit patent grant.
- Apache 2.0 — permissive with attribution and an express patent licence.

## Decision outcome

CC0 1.0, as already applied to every VilnaCRM public repository. The SPDX identifier in
`package.json` matches `LICENSE`, so licence scanners report a declared, OSI-recognised licence
rather than "undeclared".

## Consequences

- Consumers need no attribution and no licence file propagation.
- CC0 grants no patent rights. A public npm promotion (#34) re-evaluates this against the
  licensing and IP clearance it requires; a change is recorded as a new decision that supersedes
  this one, applied to the whole organisation rather than to one repository.
