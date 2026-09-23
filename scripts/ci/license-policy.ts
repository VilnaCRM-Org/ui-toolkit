export interface FontLicenseRule {
  id: string;
  signature: RegExp;
}

export interface LicensePolicy {
  packageLicense: string;
  licenseSignature: string;
  allowedLicenses: readonly string[];
  fontLicenses: readonly FontLicenseRule[];
  noticesFile: string;
}

export interface SurfaceFinding {
  file: string;
  rule: string;
  match: string;
}

interface SurfaceRule {
  rule: string;
  pattern: RegExp;
  thirdPartyExempt: boolean;
}

export const LICENSE_POLICY: LicensePolicy = {
  packageLicense: 'CC0-1.0',
  licenseSignature: 'CC0 1.0 Universal',
  allowedLicenses: [
    '0BSD',
    'Apache-2.0',
    'BlueOak-1.0.0',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'CC0-1.0',
    'ISC',
    'MIT',
    'OFL-1.1',
    'Unlicense',
  ],
  fontLicenses: [{ id: 'OFL-1.1', signature: /SIL Open Font License, Version 1\.1/ }],
  noticesFile: 'THIRD-PARTY-NOTICES.txt',
};

const PRIVATE_HOST =
  'localhost|127(?:\\.\\d{1,3}){3}|0\\.0\\.0\\.0|10(?:\\.\\d{1,3}){3}|192\\.168(?:\\.\\d{1,3}){2}' +
  '|172\\.(?:1[6-9]|2\\d|3[01])(?:\\.\\d{1,3}){2}' +
  '|[\\w-]+(?:\\.[\\w-]+)*\\.(?:internal|local|localdomain|lan|corp|intranet|home\\.arpa)';

const SURFACE_RULES: readonly SurfaceRule[] = [
  {
    rule: 'internal-url',
    pattern: new RegExp(`\\b(?:https?|wss?|ftp)://(?:${PRIVATE_HOST})(?=[:/?#"'\`\\s)]|$)`, 'gi'),
    thirdPartyExempt: false,
  },
  { rule: 'internal-url', pattern: /\blocalhost:\d{2,5}\b/gi, thirdPartyExempt: false },
  {
    rule: 'proprietary-marker',
    pattern: /\b(?:PROPRIETARY|CONFIDENTIAL)\b/g,
    thirdPartyExempt: true,
  },
  { rule: 'proprietary-marker', pattern: /\binternal use only\b/gi, thirdPartyExempt: true },
  { rule: 'proprietary-marker', pattern: /\bdo not (?:re)?distribute\b/gi, thirdPartyExempt: true },
  { rule: 'proprietary-marker', pattern: /\btrade secret\b/gi, thirdPartyExempt: true },
];

const THIRD_PARTY_TEXT_FILES: readonly string[] = ['LICENSE', LICENSE_POLICY.noticesFile];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function licenseName(entry: unknown): string | undefined {
  if (typeof entry === 'string') return entry;
  return isRecord(entry) && typeof entry.type === 'string' ? entry.type : undefined;
}

export function declaredLicense(manifest: unknown): string | undefined {
  if (!isRecord(manifest)) return undefined;
  const single: string | undefined = licenseName(manifest.license);
  if (single !== undefined || !Array.isArray(manifest.licenses)) return single;
  const names: string[] = manifest.licenses.map(licenseName).filter(isDefined);
  return names.length === 0 ? undefined : names.join(' OR ');
}

function isDefined(value: string | undefined): value is string {
  return value !== undefined;
}

function identifiers(expression: string): string[] {
  return expression
    .replace(/[()]/g, ' ')
    .split(/\s+(?:OR|AND)\s+|\s+/)
    .filter(token => token !== '');
}

function unwrap(expression: string): string {
  const trimmed: string = expression.trim();
  const inner: string = trimmed.slice(1, -1);
  const wrapped: boolean = trimmed.startsWith('(') && trimmed.endsWith(')');
  return wrapped && !/[()]/.test(inner) ? inner.trim() : trimmed;
}

export function isAllowedExpression(expression: string, allowed: readonly string[]): boolean {
  const body: string = unwrap(expression);
  if (body === '') return false;
  if (/[()]|\bWITH\b/.test(body)) {
    return identifiers(body).every(id => allowed.includes(id));
  }
  return body
    .split(/\s+OR\s+/)
    .some(alternative => alternative.split(/\s+AND\s+/).every(id => allowed.includes(id.trim())));
}

export function packageLicenseViolation(
  name: string,
  manifest: unknown,
  policy: LicensePolicy
): string | undefined {
  const license: string | undefined = declaredLicense(manifest);
  if (license === undefined) return `${name} declares no licence`;
  if (isAllowedExpression(license, policy.allowedLicenses)) return undefined;
  return `${name} is licensed ${license}, which the allow-list does not permit`;
}

export function projectLicenseViolations(
  manifest: unknown,
  licenseText: string | undefined,
  policy: LicensePolicy
): string[] {
  const violations: string[] = [];
  const declared: string | undefined = declaredLicense(manifest);
  if (declared !== policy.packageLicense) {
    violations.push(
      `package.json declares ${declared ?? 'no licence'}, not ${policy.packageLicense}`
    );
  }
  if (licenseText === undefined) {
    violations.push('the package ships no LICENSE file');
  } else if (!licenseText.includes(policy.licenseSignature)) {
    violations.push(`LICENSE is not the ${policy.packageLicense} text`);
  }
  return violations;
}

export function fontLicenseViolation(
  file: string,
  description: string | undefined,
  policy: LicensePolicy
): string | undefined {
  if (description === undefined) {
    return `${file} carries no readable licence metadata (name table id 13)`;
  }
  const rule: FontLicenseRule | undefined = policy.fontLicenses.find(candidate =>
    candidate.signature.test(description)
  );
  if (rule !== undefined && policy.allowedLicenses.includes(rule.id)) return undefined;
  return `${file} is licensed "${description.slice(0, 80)}", which the allow-list does not permit`;
}

export function noticeViolation(
  name: string,
  version: string,
  notices: string | undefined
): string | undefined {
  if (notices !== undefined && notices.includes(`${name}@${version}`)) return undefined;
  return `${name}@${version} is bundled without an entry in ${LICENSE_POLICY.noticesFile}`;
}

function isThirdPartyText(file: string): boolean {
  const base: string = file.split('/').pop() ?? file;
  return THIRD_PARTY_TEXT_FILES.includes(base);
}

function ruleFindings(file: string, text: string, rule: SurfaceRule): SurfaceFinding[] {
  if (rule.thirdPartyExempt && isThirdPartyText(file)) return [];
  return [...text.matchAll(rule.pattern)].map(match => ({
    file,
    rule: rule.rule,
    match: match[0],
  }));
}

export function surfaceFindings(file: string, text: string): SurfaceFinding[] {
  return SURFACE_RULES.flatMap(rule => ruleFindings(file, text, rule));
}

export function bundledPackageDir(source: string): string | undefined {
  const match: RegExpExecArray | null = /^.*node_modules\/(?:@[^/]+\/)?[^/]+/.exec(
    source.replace(/\\/g, '/').replace(/^(?:\.\.\/|\.\/)+/, '')
  );
  return match === null ? undefined : match[0];
}
