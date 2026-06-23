/**
 * Caret (^) version-range policy for `package.json`.
 *
 * The repository convention requires every `dependencies`/`devDependencies`
 * entry to use a caret range (or an explicitly exempt specifier such as a
 * workspace protocol, tarball URL, or dist-tag). This module contains the pure
 * classification logic; {@link ../check-dependency-ranges.ts} is the CLI that
 * runs it against the real manifest.
 */

/** Manifest fields the policy inspects. Other fields (e.g. `peerDependencies`) are out of scope. */
export const SCANNED_DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'] as const;

/** A single dependency whose specifier violates the caret-range policy. */
export interface RangeViolation {
  field: string;
  name: string;
  specifier: string;
  reason: string;
}

/** Specifiers that are not semver ranges at all and are therefore outside the policy. */
const EXEMPT_SPECIFIER_PATTERNS: readonly RegExp[] = [
  /:\/\//, // protocol URL, e.g. git+https://… or https://…/pkg.tgz
  /\//, // path or repo shorthand, e.g. file:../x or owner/repo
  /^[a-z][a-z0-9+.-]*:/i, // protocol prefix, e.g. workspace:, npm:, file:, link:
];

/**
 * True for semver wildcard tokens such as `*`, `x`, `X`, `1.x`, or `x.x.x` —
 * version parts that resolve to "any". These are real ranges (not dist-tags),
 * so they must stay subject to the caret policy rather than being exempted.
 */
function isWildcardRange(specifier: string): boolean {
  return /^[\dxX*]+(\.[\dxX*]+)*$/.test(specifier) && /[xX*]/.test(specifier);
}

/**
 * True for an npm dist-tag (e.g. `latest`, `next`, `beta`): an alphabetic label
 * that is neither a `v`-prefixed version (`v1.2.3`) nor a semver wildcard
 * (`x`, `X`), both of which must remain subject to the policy.
 */
function isDistTag(specifier: string): boolean {
  return /^[a-z]/i.test(specifier) && !/^v\d/i.test(specifier) && !isWildcardRange(specifier);
}

/** True when the specifier is not a versioned range the caret policy governs. */
export function isExemptSpecifier(specifier: string): boolean {
  const t = specifier.trim();
  if (t === '') return false;
  return EXEMPT_SPECIFIER_PATTERNS.some(pattern => pattern.test(t)) || isDistTag(t);
}

/** True when the specifier is a caret range (the only compliant range form). */
export function usesCaretRange(specifier: string): boolean {
  return specifier.trim().startsWith('^');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Classifies a single dependency entry, returning a {@link RangeViolation} when
 * it is governed by the policy but does not use a caret range, otherwise `null`.
 */
function evaluateSpecifier(
  field: string,
  name: string,
  rawSpecifier: unknown,
  exceptions: Set<string>
): RangeViolation | null {
  if (exceptions.has(name)) return null;

  // A non-string specifier (e.g. the boolean `true`) must never be coerced and
  // then matched against the exemption patterns: `String(true)` → "true" would
  // be misread as a dist-tag and silently exempted. Treat any non-string as a
  // violation outright.
  if (typeof rawSpecifier !== 'string') {
    return { field, name, specifier: String(rawSpecifier), reason: 'expected a caret (^) range' };
  }

  const specifier = rawSpecifier;
  if (isExemptSpecifier(specifier)) return null;
  if (usesCaretRange(specifier)) return null;

  return { field, name, specifier, reason: 'expected a caret (^) range' };
}

/**
 * Scans the manifest's dependency fields and returns every entry that violates
 * the caret-range policy. Packages named in `allowedExceptions` are skipped.
 */
export function findRangeViolations(
  pkg: unknown,
  allowedExceptions?: Iterable<string>
): RangeViolation[] {
  const violations: RangeViolation[] = [];
  if (!isRecord(pkg)) return violations;

  const exceptions = new Set(allowedExceptions ?? []);

  for (const field of SCANNED_DEPENDENCY_FIELDS) {
    const entries = pkg[field];
    if (!isRecord(entries)) continue;

    for (const [name, rawSpecifier] of Object.entries(entries)) {
      const violation = evaluateSpecifier(field, name, rawSpecifier, exceptions);
      if (violation) violations.push(violation);
    }
  }

  return violations;
}

/** Renders violations as an indented, human-readable report (empty string when none). */
export function formatReport(violations: RangeViolation[]): string {
  if (violations.length === 0) return '';

  return violations
    .map(v => `  ${v.field}.${v.name}: "${v.specifier}" - expected a caret (^) range`)
    .join('\n');
}

/**
 * Evaluates a parsed `package.json`, returning the policy verdict together with
 * the raw violations and a report string suitable for CLI output.
 */
export function evaluatePackageJson(
  pkg: unknown,
  allowedExceptions?: Iterable<string>
): { ok: boolean; violations: RangeViolation[]; report: string } {
  const violations = findRangeViolations(pkg, allowedExceptions);
  const ok = violations.length === 0;
  const report = ok
    ? 'All dependencies and devDependencies use caret (^) ranges.'
    : formatReport(violations);

  return { ok, violations, report };
}
