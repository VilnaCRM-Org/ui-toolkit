export const SCANNED_DEPENDENCY_FIELDS = ['dependencies', 'devDependencies'] as const;

export interface RangeViolation {
  field: string;
  name: string;
  specifier: string;
  reason: string;
}

export function isExemptSpecifier(specifier: string): boolean {
  const t = specifier.trim();
  if (t === '') return false;
  if (t.includes('://')) return true;
  if (t.includes('/')) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return true;
  if (/^[a-z]/i.test(t) && !/^v\d/i.test(t)) return true;
  return false;
}

export function usesCaretRange(specifier: string): boolean {
  return specifier.trim().startsWith('^');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

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
      if (exceptions.has(name)) continue;

      const specifier = String(rawSpecifier);
      if (isExemptSpecifier(specifier)) continue;

      if (!usesCaretRange(specifier)) {
        violations.push({
          field,
          name,
          specifier,
          reason: 'expected a caret (^) range',
        });
      }
    }
  }

  return violations;
}

export function formatReport(violations: RangeViolation[]): string {
  if (violations.length === 0) return '';

  return violations
    .map(v => `  ${v.field}.${v.name}: "${v.specifier}" - expected a caret (^) range`)
    .join('\n');
}

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
