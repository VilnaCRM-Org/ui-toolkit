# Security policy

## Scope

This policy covers the published `@vilnacrm/ui-toolkit` package (the React components, themes and
tokens under `src/`, and the build output shipped to npm) together with the container images this
repository builds for CI (`Dockerfile`, `Dockerfile.playwright`, `Dockerfile.rca`) and the workflow
automation under `.github/`.

Applications that consume the toolkit are out of scope — report those to the owning repository.

## Supported versions

The toolkit is pre-1.0, so only the most recent published release receives fixes. There are no
backports to earlier lines: a security fix ships as a new `0.x` release.

| Version line                   | Supported                          |
| ------------------------------ | ---------------------------------- |
| Latest published `0.x` release | Yes                                |
| Any earlier `0.x` release      | No — upgrade to the latest release |

## Reporting a vulnerability

Do not open a public issue, pull request or discussion for a suspected vulnerability.

1. Preferred channel — GitHub private vulnerability reporting:
   [open a draft advisory](https://github.com/VilnaCRM-Org/ui-toolkit/security/advisories/new).
   The report stays private to you and the maintainers until an advisory is published.
2. If private reporting is unavailable to you, contact the maintainers listed in
   [.github/CODEOWNERS](.github/CODEOWNERS) directly through their GitHub profiles and ask for a
   private channel before sending any details.

Please include, as far as you can establish it:

- the affected version, commit or image digest;
- the component, workflow or Dockerfile involved;
- reproduction steps or a proof of concept;
- the impact you believe an attacker could achieve.

## Response targets

These are targets, measured from the moment a report is received, not contractual guarantees.

| Stage                                 | Target                                             |
| ------------------------------------- | -------------------------------------------------- |
| Acknowledge receipt                   | 2 business days                                    |
| Triage, reproduce and assign severity | 7 calendar days                                    |
| Fix or documented mitigation          | 90 calendar days; critical and high severity first |

If a stage is going to slip, the maintainers will say so on the advisory thread rather than let it
go quiet.

## Coordinated disclosure

Reports are handled under coordinated disclosure. The maintainers will agree a disclosure date with
the reporter, publish a GitHub Security Advisory with a CVE where one applies, and credit the
reporter unless they ask to stay anonymous. Please give the maintainers the response window above
before disclosing publicly.

## Known vulnerabilities and inventory

Open advisories and dependency alerts are tracked on the repository's
[Security tab](https://github.com/VilnaCRM-Org/ui-toolkit/security); this file deliberately does not
duplicate that list, so it cannot go stale.

Supply-chain posture is measured continuously:

- the `sbom` workflow publishes CycloneDX SBOMs as build artifacts on every pull request and
  every push to `main`: one for the declared dependency set and one per CI image, the latter
  scanned after installation so it carries the fully resolved tree;
- the `OSSF Scorecard` workflow publishes the repository's supply-chain score and uploads its
  findings to code scanning;
- CodeQL (`security testing`) analyses the TypeScript sources on every pull request.
