/**
 * Unused-dependency policy for `package.json`.
 *
 * Every `dependencies`/`devDependencies` entry must be referenced by something
 * the repository actually builds, runs, or configures, so a package whose last
 * consumer is gone cannot linger in the manifest. This module contains the pure
 * classification logic; {@link ./check-unused-dependencies.ts} is the CLI that
 * assembles the scan corpus and runs it against the real manifest.
 */

/**
 * Manifest fields the policy scans. `peerDependencies` is deliberately absent:
 * it is an implicit-usage source (see {@link findUnusedDependencies}), not a
 * field whose entries must themselves be referenced.
 */
export const SCANNED_DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'] as const;

/** A dependency that is declared but named by no file in the scan corpus. */
export interface UnusedDependency {
  field: string;
  name: string;
  reason: string;
}

/** A package a name scan cannot see, paired with the mechanism that resolves it. */
export interface ImplicitUsage {
  name: string;
  evidence: string;
}

/**
 * The only packages exempt from the name scan: each is resolved through an
 * alias, a bin name, or a convention-named config file, so its package name
 * never appears anywhere. Every entry states the exact resolving mechanism and
 * the file that triggers it — an entry without one does not belong here.
 */
export const IMPLICITLY_RESOLVED: readonly ImplicitUsage[] = [
  {
    name: 'jest-environment-jsdom',
    evidence: "jest.config.ts sets testEnvironment: 'jsdom'; Jest expands that short name.",
  },
  {
    name: 'eslint-import-resolver-typescript',
    evidence:
      'eslint.config.mjs sets settings["import/resolver"].typescript; eslint-plugin-import ' +
      'expands that key to eslint-import-resolver-typescript.',
  },
  {
    name: 'markdownlint-cli',
    evidence: "Makefile lint-md runs `bun x markdownlint`, this package's bin name.",
  },
  {
    name: '@lhci/cli',
    evidence:
      "Makefile lighthouse-desktop and lighthouse-mobile run `bun x lhci`, this package's bin.",
  },
  {
    name: '@commitlint/cli',
    evidence:
      "commitlint.config.js is the convention-named config of this package's `commitlint` bin, " +
      'run from the git hooks installed by make git-hooks-install.',
  },
];

/** `@types/*` packages are pulled in by the TypeScript compiler, never imported by name. */
const TYPES_PACKAGE_PREFIX = '@types/';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** True for a `@types/*` package, which TypeScript consumes without any import. */
export function isTypesPackage(name: string): boolean {
  return name.startsWith(TYPES_PACKAGE_PREFIX);
}

/** The documented implicit-usage entry for `name`, or `undefined` when there is none. */
export function findImplicitUsage(name: string): ImplicitUsage | undefined {
  return IMPLICITLY_RESOLVED.find(entry => entry.name === name);
}

/** True when any corpus file mentions the package name. */
function isReferenced(name: string, corpus: readonly string[]): boolean {
  return corpus.some(contents => contents.includes(name));
}

/**
 * Returns every declared dependency that no corpus file names. A package is
 * treated as used when it is a `@types/*` package, when it also appears in
 * `peerDependencies` (the toolkit requires the consumer to supply it, and the
 * devDependency exists to satisfy that peer locally), or when it carries a
 * documented {@link IMPLICITLY_RESOLVED} entry.
 */
export function findUnusedDependencies(
  pkg: unknown,
  corpus: readonly string[]
): UnusedDependency[] {
  const unused: UnusedDependency[] = [];
  if (!isRecord(pkg)) return unused;

  const peers = isRecord(pkg.peerDependencies) ? new Set(Object.keys(pkg.peerDependencies)) : null;

  for (const field of SCANNED_DEPENDENCY_FIELDS) {
    const entries = pkg[field];
    if (!isRecord(entries)) continue;

    for (const name of Object.keys(entries)) {
      if (isTypesPackage(name)) continue;
      if (peers?.has(name)) continue;
      if (findImplicitUsage(name)) continue;
      if (isReferenced(name, corpus)) continue;

      unused.push({ field, name, reason: 'no file in the scan corpus names this package' });
    }
  }

  return unused;
}

/** Renders unused dependencies as an indented, human-readable report (empty string when none). */
export function formatReport(unused: UnusedDependency[]): string {
  if (unused.length === 0) return '';

  return unused.map(u => `  ${u.field}.${u.name}: ${u.reason}`).join('\n');
}

/**
 * Evaluates a parsed `package.json` against the scan corpus, returning the
 * verdict together with the raw findings and a report string for CLI output.
 */
export function evaluatePackageJson(
  pkg: unknown,
  corpus: readonly string[]
): { ok: boolean; unused: UnusedDependency[]; report: string } {
  const unused = findUnusedDependencies(pkg, corpus);
  const ok = unused.length === 0;
  const report = ok
    ? 'Every dependency and devDependency is referenced by the scanned source tree.'
    : formatReport(unused);

  return { ok, unused, report };
}
